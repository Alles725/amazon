import { ApiError } from '../../common/api-error';
import { CatalogProductDetails, ErrorCode, MAX_CART_QUANTITY } from '@amazon-mvp/api-contract';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Inventory, Product, Prisma } from '@amazon-mvp/database';
import { PrismaService } from '../../common/prisma.service';
import { CatalogApi, CatalogProduct, ProductPage } from './catalog.api';

@Injectable()
export class CatalogService implements CatalogApi {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(query: {
    page?: number;
    pageSize?: number;
    category?: string;
  }): Promise<ProductPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    // A category includes its whole subtree: "Games e Consoles" lists its controllers.
    const categoryIds = query.category ? await this.subtreeIds(query.category) : null;
    const where = {
      active: true,
      ...(categoryIds ? { categories: { some: { categoryId: { in: categoryIds } } } } : {}),
    };
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { inventory: true },
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items: products.map(toCatalogProduct), total };
  }

  async consumeForOrder(
    items: Array<{ productId: string; quantity: number }>,
    tx: Prisma.TransactionClient,
  ): Promise<CatalogProduct[]> {
    const products: CatalogProduct[] = [];
    // Same order across checkouts prevents lock inversion for shared products.
    for (const item of [...items].sort((a, b) => a.productId.localeCompare(b.productId))) {
      await tx.$queryRaw`SELECT id FROM products WHERE id = ${item.productId}::uuid FOR UPDATE`;
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: { inventory: true },
      });
      if (
        !product?.active ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > MAX_CART_QUANTITY
      )
        throw new ApiError(
          ErrorCode.CART_ITEM_UNAVAILABLE,
          'Um produto não está mais disponível. Revise o carrinho.',
          HttpStatus.CONFLICT,
        );
      const changed =
        await tx.$executeRaw`UPDATE inventory SET quantity = quantity - ${item.quantity}, updated_at = NOW() WHERE product_id = ${item.productId}::uuid AND quantity - reserved >= ${item.quantity}`;
      if (changed !== 1)
        throw new ApiError(
          ErrorCode.CART_ITEM_UNAVAILABLE,
          'Estoque insuficiente. Revise as quantidades do carrinho.',
          HttpStatus.CONFLICT,
        );
      products.push(toCatalogProduct(product));
    }
    return products;
  }

  async getProduct(identifier: string): Promise<CatalogProductDetails | null> {
    // Validate before querying a PostgreSQL UUID column; slugs remain supported.
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const include = { inventory: true, categories: { include: { category: true } } } as const;
    const product =
      (isId
        ? await this.prisma.product.findUnique({ where: { id: identifier }, include })
        : null) ?? (await this.prisma.product.findUnique({ where: { slug: identifier }, include }));
    if (!product) return null;
    const categories = product.categories
      .map(({ category }) => category)
      .sort((a, b) => a.slug.localeCompare(b.slug));
    // The most specific category (deepest chain) drives the breadcrumb; ties keep slug order.
    let categoryPath: Array<{ slug: string; name: string }> = [];
    for (const category of categories) {
      const path = await this.ancestorPath(category.id);
      if (path.length > categoryPath.length) categoryPath = path;
    }
    return {
      ...toCatalogProduct(product),
      categories: categories.map(({ slug, name }) => ({ slug, name })),
      categoryPath,
    };
  }

  /** Root → category chain. The depth guard keeps a corrupted cycle from looping forever. */
  private async ancestorPath(categoryId: string): Promise<Array<{ slug: string; name: string }>> {
    const rows = await this.prisma.$queryRaw<Array<{ slug: string; name: string }>>`
      WITH RECURSIVE chain AS (
        SELECT id, parent_id, slug, name, 0 AS depth FROM categories WHERE id = ${categoryId}::uuid
        UNION ALL
        SELECT c.id, c.parent_id, c.slug, c.name, chain.depth + 1
        FROM categories c JOIN chain ON c.id = chain.parent_id
        WHERE chain.depth < 20
      )
      SELECT slug, name FROM chain ORDER BY depth DESC`;
    return rows;
  }

  private async subtreeIds(slug: string): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      WITH RECURSIVE tree AS (
        SELECT id, 0 AS depth FROM categories WHERE slug = ${slug}
        UNION ALL
        SELECT c.id, tree.depth + 1 FROM categories c JOIN tree ON c.parent_id = tree.id
        WHERE tree.depth < 20
      )
      SELECT DISTINCT id::text AS id FROM tree`;
    return rows.map((row) => row.id);
  }

  async findBySlug(slug: string): Promise<CatalogProduct | null> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { inventory: true },
    });
    return product ? toCatalogProduct(product) : null;
  }

  async findByIds(ids: string[]): Promise<CatalogProduct[]> {
    if (!ids.length) return [];
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: { inventory: true },
    });
    return products.map(toCatalogProduct);
  }
}

function toCatalogProduct(product: Product & { inventory: Inventory | null }): CatalogProduct {
  const availableQuantity = product.active
    ? Math.max(0, (product.inventory?.quantity ?? 0) - (product.inventory?.reserved ?? 0))
    : 0;
  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    description: product.description,
    priceMinor: product.priceMinor,
    currency: product.currency,
    active: product.active,
    availableQuantity,
    inStock: availableQuantity > 0,
  };
}
