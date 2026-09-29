import 'server-only';
import type { CatalogItem } from '@amazon-mvp/api-contract';
import { findCatalogProduct } from '@/features/product/product-server';
import type { Product } from './catalog-mock';

/** The Home's curated rails decide WHICH products appear and in what order; the
 * catalog decides WHAT they are. Every card is resolved to its catalog record so
 * name, price and stock match the product page, cart and checkout exactly.
 * Products missing from the catalog or inactive are left out instead of being
 * shown with fixture data. */
export async function resolveHomeProducts(
  curated: Product[][],
): Promise<(products: Product[]) => CatalogItem[]> {
  const slugs = [...new Set(curated.flat().map((product) => product.id))];
  const records = await Promise.all(slugs.map(findCatalogProduct));
  const bySlug = new Map(
    records
      .filter((record): record is NonNullable<typeof record> => record !== null && record.active)
      .map((record) => [record.slug, record]),
  );
  return (products) =>
    products.flatMap((product) => {
      const record = bySlug.get(product.id);
      return record ? [record] : [];
    });
}
