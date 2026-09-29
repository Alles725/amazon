import { Prisma } from '@amazon-mvp/database';
import { CatalogItem, CatalogPage, CatalogProductDetails } from '@amazon-mvp/api-contract';

export const CATALOG_API = 'CATALOG_API';
export type CatalogProduct = CatalogItem;
export type ProductPage = CatalogPage;

/** Catalog owns products, categories and inventory. */
export interface CatalogApi {
  consumeForOrder(
    items: Array<{ productId: string; quantity: number }>,
    tx: Prisma.TransactionClient,
  ): Promise<CatalogProduct[]>;
  listProducts(query: {
    page?: number;
    pageSize?: number;
    category?: string;
    slugs?: string[];
  }): Promise<ProductPage>;
  getProduct(identifier: string): Promise<CatalogProductDetails | null>;
  findBySlug(slug: string): Promise<CatalogProduct | null>;
  /** Includes unavailable records so existing cart lines remain removable. */
  findByIds(ids: string[]): Promise<CatalogProduct[]>;
}
