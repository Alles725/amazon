import { Prisma } from '@amazon-mvp/database';
import {
  CatalogCategoryNode,
  CatalogFacets,
  CatalogFacetsQuery,
  CatalogItem,
  CatalogListQuery,
  CatalogPage,
  CatalogProductDetails,
} from '@amazon-mvp/api-contract';

export const CATALOG_API = 'CATALOG_API';
export type CatalogProduct = CatalogItem;
export type ProductPage = CatalogPage;

/** Catalog owns products, categories and inventory. */
export interface CatalogApi {
  consumeForOrder(
    items: Array<{ productId: string; quantity: number }>,
    tx: Prisma.TransactionClient,
  ): Promise<CatalogProduct[]>;
  /** Filters combine with AND; `q` is a case- and accent-insensitive text search. */
  listProducts(query: CatalogListQuery): Promise<ProductPage>;
  listCategories(): Promise<CatalogCategoryNode[]>;
  productFacets(query: CatalogFacetsQuery): Promise<CatalogFacets>;
  getProduct(identifier: string): Promise<CatalogProductDetails | null>;
  findBySlug(slug: string): Promise<CatalogProduct | null>;
  /** Includes unavailable records so existing cart lines remain removable. */
  findByIds(ids: string[]): Promise<CatalogProduct[]>;
}
