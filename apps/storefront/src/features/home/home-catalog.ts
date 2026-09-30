import 'server-only';
import { listBySlugs } from '@/features/product/product-server';
import { withRatings } from '@/features/product/reviews/product-reviews';
import type { RatedCatalogItem } from '@/features/product/reviews/ratings';
import type { Product } from './catalog-mock';

/** The Home's curated rails decide WHICH products appear and in what order; the
 * catalog decides WHAT they are. Every card is resolved to its catalog record so
 * name, price and stock match the product page, cart and checkout exactly.
 * Products missing from the catalog or inactive are left out instead of being
 * shown with fixture data. All rails are resolved together in one batched lookup
 * (not one request per card), and so are their ratings (reviews API). */
export async function resolveHomeProducts(
  curated: Product[][],
): Promise<(products: Product[]) => RatedCatalogItem[]> {
  const slugs = [...new Set(curated.flat().map((product) => product.id))];
  const records = await withRatings((await listBySlugs(slugs)).filter((record) => record.active));
  const bySlug = new Map(records.map((record) => [record.slug, record]));
  return (products) =>
    products.flatMap((product) => {
      const record = bySlug.get(product.id);
      return record ? [record] : [];
    });
}
