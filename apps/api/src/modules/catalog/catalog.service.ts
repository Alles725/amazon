import { ApiError } from '../../common/api-error';
import {
  CATALOG_FACET_SLUG_LIMIT,
  CATALOG_PRICE_BOUNDS_MINOR,
  CatalogCategoryNode,
  CatalogFacets,
  CatalogFacetsQuery,
  CatalogListQuery,
  CatalogProductDetails,
  CatalogSort,
  ErrorCode,
  MAX_CART_QUANTITY,
} from '@amazon-mvp/api-contract';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Inventory, Product, Prisma } from '@amazon-mvp/database';
import { PrismaService } from '../../common/prisma.service';
import { CatalogApi, CatalogProduct, ProductPage } from './catalog.api';
import {
  ACCENTED,
  PLAIN,
  containsPattern,
  escapeLike,
  normalizeText,
  searchTokens,
} from './catalog-search';

/** Unreserved stock (the same rule as toCatalogProduct's inStock for active records). */
const AVAILABLE_SQL = Prisma.sql`(COALESCE(i.quantity, 0) - COALESCE(i.reserved, 0)) > 0`;

/** Lowercase, accent-free form of a column, compared with searchTokens() output. */
const folded = (column: Prisma.Sql) =>
  Prisma.sql`translate(lower(${column}), ${ACCENTED}, ${PLAIN})`;
const NAME = folded(Prisma.sql`p.name`);
const DESCRIPTION = folded(Prisma.sql`COALESCE(p.description, '')`);

/** One of the product's own categories is named like the token ("fone" → "Fones de Ouvido"). */
const categoryNameMatch = (pattern: string) => Prisma.sql`EXISTS (
  SELECT 1 FROM product_categories pcn JOIN categories cn ON cn.id = pcn.category_id
  WHERE pcn.product_id = p.id AND ${folded(Prisma.sql`cn.name`)} LIKE ${pattern})`;

/** Deterministic order; the id tie-breaker keeps pages stable. `relevance` without a
 * query is alphabetical, the listing's historical default. */
function orderSql(sort: CatalogSort | undefined, tokens: string[], query = ''): Prisma.Sql {
  switch (sort) {
    case 'price-asc':
      return Prisma.sql`p.price_minor ASC, p.name ASC, p.id ASC`;
    case 'price-desc':
      return Prisma.sql`p.price_minor DESC, p.name ASC, p.id ASC`;
    case 'newest':
      return Prisma.sql`p.created_at DESC, p.name ASC, p.id ASC`;
    default: {
      if (!tokens.length) return Prisma.sql`p.name ASC, p.id ASC`;
      // Name hits outweigh category hits, which outweigh description hits; a name that
      // starts with the whole query ranks first.
      const perToken = tokens.map((token) => {
        const pattern = containsPattern(token);
        return Prisma.sql`CASE WHEN ${NAME} LIKE ${pattern} THEN 3 ELSE 0 END
          + CASE WHEN ${categoryNameMatch(pattern)} THEN 2 ELSE 0 END
          + CASE WHEN ${DESCRIPTION} LIKE ${pattern} THEN 1 ELSE 0 END`;
      });
      const phrase = `${escapeLike(normalizeText(query).trim())}%`;
      return Prisma.sql`(CASE WHEN ${NAME} LIKE ${phrase} THEN 5 ELSE 0 END
        + ${Prisma.join(perToken, ' + ')}) DESC, p.name ASC, p.id ASC`;
    }
  }
}

@Injectable()
export class CatalogService implements CatalogApi {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(query: CatalogListQuery): Promise<ProductPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const tokens = searchTokens(query.q);
    const where = await this.whereSql(query, tokens);
    if (!where) return { items: [], total: 0 };
    // Filtering, ranking and paging happen in SQL; the page's records are then loaded
    // through Prisma (with inventory) and put back in the ranked order.
    const [rows, counted] = await this.prisma.$transaction([
      this.prisma.$queryRaw<Array<{ id: string }>>`
        SELECT p.id::text AS id FROM products p LEFT JOIN inventory i ON i.product_id = p.id
        WHERE ${where}
        ORDER BY ${orderSql(query.sort, tokens, query.q)}
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
      this.prisma.$queryRaw<Array<{ total: number }>>`
        SELECT COUNT(*)::int AS total
        FROM products p LEFT JOIN inventory i ON i.product_id = p.id
        WHERE ${where}`,
    ]);
    const products = rows.length
      ? await this.prisma.product.findMany({
          where: { id: { in: rows.map((row) => row.id) } },
          include: { inventory: true },
        })
      : [];
    const byId = new Map(products.map((product) => [product.id, product]));
    return {
      items: rows.flatMap((row) => {
        const product = byId.get(row.id);
        return product ? [toCatalogProduct(product)] : [];
      }),
      total: counted[0]?.total ?? 0,
    };
  }

  /** The whole taxonomy, flat; small enough (tens of rows) for one response. */
  async listCategories(): Promise<CatalogCategoryNode[]> {
    const categories = await this.prisma.category.findMany({
      include: { parent: { select: { slug: true } } },
      orderBy: [{ name: 'asc' }, { slug: 'asc' }],
    });
    return categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      parentSlug: category.parent?.slug ?? null,
    }));
  }

  /** Facet counts over the search scope (q + category + slugs); see CatalogFacets. */
  async productFacets(query: CatalogFacetsQuery): Promise<CatalogFacets> {
    const where = await this.whereSql(
      { q: query.q, category: query.category, slugs: query.slugs },
      searchTokens(query.q),
    );
    const bounds = [0, ...CATALOG_PRICE_BOUNDS_MINOR];
    const buckets = bounds.map((minMinor, index) => ({
      minMinor,
      maxMinor: bounds[index + 1] ?? null,
    }));
    if (!where)
      return {
        total: 0,
        inStock: 0,
        priceBuckets: buckets.map((bucket) => ({ ...bucket, count: 0 })),
        categories: [],
        slugs: [],
        slugsTruncated: false,
      };
    const bucketCounts = Prisma.join(
      buckets.map(({ minMinor, maxMinor }) =>
        maxMinor === null
          ? Prisma.sql`COUNT(*) FILTER (WHERE p.price_minor >= ${minMinor})`
          : Prisma.sql`COUNT(*) FILTER (WHERE p.price_minor >= ${minMinor} AND p.price_minor < ${maxMinor})`,
      ),
    );
    const [totals, categories, slugs] = await this.prisma.$transaction([
      this.prisma.$queryRaw<Array<{ total: number; in_stock: number; buckets: number[] }>>`
        SELECT COUNT(*)::int AS total,
          (COUNT(*) FILTER (WHERE ${AVAILABLE_SQL}))::int AS in_stock,
          ARRAY[${bucketCounts}]::int[] AS buckets
        FROM products p LEFT JOIN inventory i ON i.product_id = p.id
        WHERE ${where}`,
      // Each matched product counts once for each of its categories and every ancestor.
      this.prisma.$queryRaw<Array<{ slug: string; count: number }>>`
        WITH RECURSIVE matched AS (
          SELECT p.id FROM products p LEFT JOIN inventory i ON i.product_id = p.id
          WHERE ${where}
        ), chain AS (
          SELECT pc.product_id, pc.category_id AS id, 0 AS depth
          FROM product_categories pc JOIN matched m ON m.id = pc.product_id
          UNION
          SELECT chain.product_id, c.parent_id, chain.depth + 1
          FROM chain JOIN categories c ON c.id = chain.id
          WHERE c.parent_id IS NOT NULL AND chain.depth < 20
        )
        SELECT c.slug, COUNT(DISTINCT chain.product_id)::int AS count
        FROM chain JOIN categories c ON c.id = chain.id
        GROUP BY c.slug ORDER BY c.slug`,
      this.prisma.$queryRaw<Array<{ slug: string }>>`
        SELECT p.slug FROM products p LEFT JOIN inventory i ON i.product_id = p.id
        WHERE ${where} ORDER BY p.slug LIMIT ${CATALOG_FACET_SLUG_LIMIT + 1}`,
    ]);
    const summary = totals[0];
    return {
      total: summary?.total ?? 0,
      inStock: summary?.in_stock ?? 0,
      priceBuckets: buckets.map((bucket, index) => ({
        ...bucket,
        count: summary?.buckets[index] ?? 0,
      })),
      categories,
      slugs: slugs.slice(0, CATALOG_FACET_SLUG_LIMIT).map((row) => row.slug),
      slugsTruncated: slugs.length > CATALOG_FACET_SLUG_LIMIT,
    };
  }

  /** Shared WHERE clause (aliases: p = products, i = inventory). null means nothing can
   * match (an unknown category), so callers skip the queries. */
  private async whereSql(query: CatalogListQuery, tokens: string[]): Promise<Prisma.Sql | null> {
    const conditions: Prisma.Sql[] = [Prisma.sql`p.active = true`];
    if (query.category) {
      // A category includes its whole subtree: "Games e Consoles" lists its controllers.
      const categoryIds = await this.subtreeIds(query.category);
      if (!categoryIds.length) return null;
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM product_categories pc
        WHERE pc.product_id = p.id AND pc.category_id = ANY(${categoryIds}::uuid[]))`);
    }
    if (query.slugs) conditions.push(Prisma.sql`p.slug = ANY(${query.slugs}::text[])`);
    if (query.minPriceMinor !== undefined)
      conditions.push(Prisma.sql`p.price_minor >= ${query.minPriceMinor}`);
    if (query.maxPriceMinor !== undefined)
      conditions.push(Prisma.sql`p.price_minor < ${query.maxPriceMinor}`);
    if (query.inStock) conditions.push(AVAILABLE_SQL);
    // Every token must appear in the name, the description or one of the category names.
    for (const token of tokens) {
      const pattern = containsPattern(token);
      conditions.push(Prisma.sql`(${NAME} LIKE ${pattern} OR ${DESCRIPTION} LIKE ${pattern}
        OR ${categoryNameMatch(pattern)})`);
    }
    return Prisma.join(conditions, ' AND ');
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
