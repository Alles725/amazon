/**
 * Iteration 3 boundary placeholder (BE story: domain skeletons).
 * The interface exists so cart/orders can be written against it; the
 * implementation lands in Iteration 4. Nothing here touches another module's
 * tables — catalog owns products/categories/inventory.
 */
export const CATALOG_API = 'CATALOG_API';

export interface CatalogProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  priceMinor: number;
  currency: string;
  inStock: boolean;
}

export interface ProductPage {
  items: CatalogProduct[];
  total: number;
}

export interface CatalogApi {
  listProducts(query: { page?: number; pageSize?: number; category?: string }): Promise<ProductPage>;
  findBySlug(slug: string): Promise<CatalogProduct | null>;
  /** Used by cart/orders to price a line without reading catalog tables. */
  findByIds(ids: string[]): Promise<CatalogProduct[]>;
}
