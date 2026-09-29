import 'server-only';
import type { CatalogItem } from '@amazon-mvp/api-contract';
import type { ProductContent } from '../product-content';
import reviewFixtures from '../../../../../../config/demo-reviews.json';

/** The product page's only source of customer reviews. There is no reviews
 * backend yet: this reads config/demo-reviews.json. Replacing it with an API call
 * returning the same ProductReviews shape needs no component changes. */

export interface ReviewMedia {
  id: string;
  kind: 'image' | 'video';
  src: string;
  alt: string;
  /** Poster frame for videos. */
  poster?: string;
  durationSeconds?: number;
}

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  /** Calendar day, YYYY-MM-DD. */
  date: string;
  country: string;
  variant: Array<{ name: string; value: string }>;
  verified: boolean;
  body: string;
  helpfulCount: number;
  images?: Array<{ src: string; alt: string }>;
}

export interface ProductReviews {
  /** null when the product has no rating at all. */
  summary: { average: number; count: number; distribution?: number[] } | null;
  media: ReviewMedia[];
  reviews: CustomerReview[];
}

interface ReviewGroupFixture {
  group: string;
  media: ReviewMedia[];
  reviews: CustomerReview[];
}

/** Variants share one review pool, like Amazon's parent listing. */
export function productReviews(product: CatalogItem, content: ProductContent): ProductReviews {
  const key = content.variant?.group ?? product.slug;
  const group = (reviewFixtures as ReviewGroupFixture[]).find((item) => item.group === key);
  return {
    summary: content.rating ?? null,
    media: group?.media ?? [],
    reviews: [...(group?.reviews ?? [])].sort(
      (a, b) => b.helpfulCount - a.helpfulCount || b.date.localeCompare(a.date),
    ),
  };
}
