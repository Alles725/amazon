import { CatalogProductDetails } from '@amazon-mvp/api-contract';
import { Injectable } from '@nestjs/common';
import { Inventory, Product } from '@amazon-mvp/database';
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
    const where = {
      active: true,
      ...(query.category ? { categories: { some: { category: { slug: query.category } } } } : {}),
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

  async getProduct(identifier: string): Promise<CatalogProductDetails | null> {
    // Validate before querying a PostgreSQL UUID column; slugs remain supported.
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const include = { inventory: true, categories: { include: { category: true } } } as const;
    const product =
      (isId
        ? await this.prisma.product.findUnique({ where: { id: identifier }, include })
        : null) ?? (await this.prisma.product.findUnique({ where: { slug: identifier }, include }));
    if (!product) return null;
    return {
      ...toCatalogProduct(product),
      categories: product.categories
        .map(({ category }) => ({ slug: category.slug, name: category.name }))
        .sort((a, b) => a.slug.localeCompare(b.slug)),
    };
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
