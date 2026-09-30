import { RatingSummary } from '@amazon-mvp/api-contract';

/** Demo listing aggregate (review_rating_baselines row). */
export interface RatingBaseline {
  listingKey: string;
  ratingCount: number;
  ratingSum: number;
  /** Percent per star level, 5 stars first; anything but 5 values = unknown. */
  distribution: number[];
}

/** Written reviews with a given star rating. */
export interface StarCount {
  rating: number;
  count: number;
}

/**
 * Merges demo listing aggregates with the written reviews. Baselines sharing a
 * listing key (variants of one listing) are counted once. The distribution is
 * only returned when every part of the aggregate has a known one; it is never
 * guessed from the average.
 */
export function summarize(baselines: RatingBaseline[], stars: StarCount[]): RatingSummary {
  const listings = new Map<string, RatingBaseline>();
  for (const row of baselines) if (!listings.has(row.listingKey)) listings.set(row.listingKey, row);

  const perStar = [0, 0, 0, 0, 0]; // index 0 = 5 stars
  let count = 0;
  let sum = 0;
  let distributionKnown = true;
  for (const row of listings.values()) {
    count += row.ratingCount;
    sum += row.ratingSum;
    if (row.distribution.length !== 5) {
      distributionKnown = false;
      continue;
    }
    row.distribution.forEach((percent, index) => {
      perStar[index] += (row.ratingCount * percent) / 100;
    });
  }
  for (const { rating, count: written } of stars) {
    count += written;
    sum += rating * written;
    perStar[5 - rating] += written;
  }

  return {
    average: count ? Math.round((sum / count) * 10) / 10 : null,
    count,
    distribution: distributionKnown
      ? perStar.map((value, index) => ({
          stars: 5 - index,
          percent: count ? Math.round((value / count) * 100) : 0,
        }))
      : null,
  };
}

/** "Camila Souza Lima" -> "Camila L."; reviews never show the full name or e-mail. */
export function publicName(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'Cliente Amazon';
  if (words.length === 1) return words[0];
  return `${words[0]} ${words[words.length - 1].charAt(0).toUpperCase()}.`;
}
