import { CatalogItem, CatalogPage, CatalogProductDetails } from '@amazon-mvp/api-contract';

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
  getProduct(identifier: string): Promise<CatalogProductDetails | null>;
  findBySlug(slug: string): Promise<CatalogProduct | null>;
  /** Includes unavailable records so existing cart lines remain removable. */
  findByIds(ids: string[]): Promise<CatalogProduct[]>;
}
