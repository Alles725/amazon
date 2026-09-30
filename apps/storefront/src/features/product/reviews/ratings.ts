import {
  REVIEW_LIMITS,
  type CatalogItem,
  type ProductRatingSummaries,
  type ProductRatingSummary,
} from '@amazon-mvp/api-contract';

/** Average and count shown on product cards; always from the reviews API. */
export interface CardRating {
  average: number;
  count: number;
}

/** A catalog record plus its rating. No `rating` = the product has none (or the
 * reviews API was unavailable): cards then show no stars instead of guesses. */
export type RatedCatalogItem = CatalogItem & { rating?: CardRating };

export function attachRatings<T extends CatalogItem>(
  items: T[],
  summaries: ProductRatingSummary[],
): Array<T & { rating?: CardRating }> {
  const byId = new Map(
    summaries.flatMap((summary) =>
      summary.count > 0 && summary.average !== null
        ? [[summary.productId, { average: summary.average, count: summary.count }] as const]
        : [],
    ),
  );
  return items.map((item) => {
    const rating = byId.get(item.id);
    return rating ? { ...item, rating } : item;
  });
}

/** Per-product summaries in batches of REVIEW_LIMITS.summariesMax. `endpoint` is the
 * same-origin route in the browser and the internal API URL on the server. */
export async function fetchRatingSummaries(
  ids: string[],
  endpoint: string,
): Promise<ProductRatingSummary[]> {
  const unique = [...new Set(ids)];
  const chunks: string[][] = [];
  for (let start = 0; start < unique.length; start += REVIEW_LIMITS.summariesMax)
    chunks.push(unique.slice(start, start + REVIEW_LIMITS.summariesMax));
  const pages = await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const response = await fetch(`${endpoint}?productIds=${chunk.join(',')}`, {
          cache: 'no-store',
        });
        return response.ok ? ((await response.json()) as ProductRatingSummaries).items : [];
      } catch {
        return [];
      }
    }),
  );
  return pages.flat();
}
