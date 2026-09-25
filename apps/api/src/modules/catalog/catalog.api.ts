import { CatalogItem, CatalogPage } from '@amazon-mvp/api-contract';

export const CATALOG_API = 'CATALOG_API';
export type CatalogProduct = CatalogItem;
export type ProductPage = CatalogPage;

/** Catalog owns products, categories and inventory. */
export interface CatalogApi {
  listProducts(query: {
    page?: number;
    pageSize?: number;
    category?: string;
  }): Promise<ProductPage>;
  findBySlug(slug: string): Promise<CatalogProduct | null>;
  /** Includes unavailable records so existing cart lines remain removable. */
  findByIds(ids: string[]): Promise<CatalogProduct[]>;
}
