import { CatalogItem, CatalogProductDetails } from '@amazon-mvp/api-contract';
import demoProducts from '../../../../../config/demo-products.json';

/** Optional demo presentation never overrides identity, price, stock or availability.
 * SKU AND slug must match so an unrelated product cannot inherit another's media. */
export function productPresentation(product: CatalogItem) {
  const demo = demoProducts.find((item) => item.id === product.slug && item.sku === product.sku);
  return {
    images: demo?.image ? [demo.image] : [],
    demo: Boolean(demo),
    oldPriceMinor:
      demo?.oldPriceMinor && demo.oldPriceMinor > product.priceMinor
        ? demo.oldPriceMinor
        : undefined,
  };
}

export function normalizeProductDetails(
  product: CatalogItem & Partial<CatalogProductDetails>,
): CatalogProductDetails {
  return {
    ...product,
    description: product.description?.trim() || null,
    categories: product.categories ?? [],
    availableQuantity: Math.max(0, product.availableQuantity ?? 0),
    inStock: product.active && product.inStock && product.availableQuantity > 0,
  };
}
