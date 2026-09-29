import { CatalogItem, CatalogProductDetails } from '@amazon-mvp/api-contract';
import type { GlyphKind } from '@/components/amazon/product-glyph';
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
    // Aggregate rating of the demo listing (the same numbers the homepage shows).
    rating:
      demo && demo.reviewCount > 0 ? { average: demo.rating, count: demo.reviewCount } : undefined,
    // Illustration used by cards when the listing has no photo.
    glyph: demo?.glyph as GlyphKind | undefined,
  };
}

export function normalizeProductDetails(
  product: CatalogItem & Partial<CatalogProductDetails>,
): CatalogProductDetails {
  return {
    ...product,
    description: product.description?.trim() || null,
    categories: product.categories ?? [],
    categoryPath: product.categoryPath ?? [],
    availableQuantity: Math.max(0, product.availableQuantity ?? 0),
    inStock: product.active && product.inStock && product.availableQuantity > 0,
  };
}
