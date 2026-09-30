import 'server-only';
import { cookies } from 'next/headers';
import type {
  CatalogItem,
  OwnReviewResponse,
  RatingSummary,
  ReviewPage,
  ReviewResponse,
  ReviewSort,
  ReviewViewerState,
} from '@amazon-mvp/api-contract';
import { getConfig } from '@/config/storefront-config';
import { attachRatings, fetchRatingSummaries } from './ratings';

/** The storefront's only reader of the reviews API (GET /reviews...). The product
 * page, the write-review page and product cards all go through here, so the
 * components keep working with the ProductReviews shape. */

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
  productId: string;
  author: string;
  rating: number;
  title: string;
  /** Calendar day in Brasília, YYYY-MM-DD. */
  date: string;
  country: string;
  /** Options of the variant that was reviewed (e.g. Cor: Verde). */
  variant: Array<{ name: string; value: string }>;
  verified: boolean;
  body: string;
  helpfulCount: number;
  images?: Array<{ src: string; alt: string }>;
  /** Written by the signed-in viewer: editable, not votable. */
  own: boolean;
  /** The signed-in viewer already marked it as helpful. */
  votedHelpful: boolean;
  /** Write-review page of the reviewed variant, only for the viewer's own review. */
  editHref?: string;
}

export interface ReviewQuery {
  sort: ReviewSort;
  stars?: number;
  page: number;
}

export interface ProductReviews {
  /** null when the product has no rating at all (count 0) or it is unavailable. */
  summary: { average: number; count: number; distribution?: number[] } | null;
  /** Customer photos/videos. There is no file storage, so this is always empty
   * and the media UI stays hidden. */
  media: ReviewMedia[];
  reviews: CustomerReview[];
  /** Written reviews matching the current filter (all pages). */
  total: number;
  pageSize: number;
  query: ReviewQuery;
  signedIn: boolean;
  /** The viewer already reviewed THIS product (the CTA becomes "Editar"). */
  hasOwnReview: boolean;
  /** The reviews API could not be reached; nothing is shown in its place. */
  unavailable: boolean;
}

export const REVIEWS_PAGE_SIZE = 8;

const apiBase = () => {
  const config = getConfig();
  return `${config.api.internalBaseUrl}${config.api.publicBasePath}`;
};

const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Sort/filter/page from the product URL; anything invalid falls back to defaults. */
export function parseReviewQuery(
  searchParams: Record<string, string | string[] | undefined> = {},
): ReviewQuery {
  const stars = Number(single(searchParams.reviewStars));
  const page = Number(single(searchParams.reviewPage));
  return {
    sort: single(searchParams.reviewSort) === 'recent' ? 'recent' : 'helpful',
    ...(Number.isInteger(stars) && stars >= 1 && stars <= 5 ? { stars } : {}),
    page: Number.isInteger(page) && page >= 1 && page <= 1000 ? page : 1,
  };
}

const brasiliaDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

async function getJson<T>(path: string, withSession = false): Promise<T | null> {
  try {
    const response = await fetch(`${apiBase()}${path}`, {
      cache: 'no-store',
      ...(withSession ? { headers: { cookie: cookies().toString() } } : {}),
    });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

const summaryView = (summary: RatingSummary): ProductReviews['summary'] =>
  summary.count > 0 && summary.average !== null
    ? {
        average: summary.average,
        count: summary.count,
        ...(summary.distribution?.length === 5
          ? { distribution: summary.distribution.map((bucket) => bucket.percent) }
          : {}),
      }
    : null;

/**
 * Reviews of a product. Variants share one review pool, like Amazon's parent
 * listing: `familyIds` holds every variant record (the product itself included)
 * and `variantOptions` labels each review with the variant that was reviewed.
 */
export async function productReviews(input: {
  productId: string;
  familyIds: string[];
  variantOptions?: Map<string, Array<{ name: string; value: string }>>;
  /** Catalog slug per family member, for the own review's edit link. */
  productSlugs?: Map<string, string>;
  query: ReviewQuery;
  signedIn: boolean;
}): Promise<ProductReviews> {
  const ids = [...new Set([input.productId, ...input.familyIds])].join(',');
  const { sort, stars, page } = input.query;
  const listParams = new URLSearchParams({
    productIds: ids,
    sort,
    page: String(page),
    pageSize: String(REVIEWS_PAGE_SIZE),
    ...(stars ? { stars: String(stars) } : {}),
  });
  const [summary, list, viewer] = await Promise.all([
    getJson<RatingSummary>(`/reviews/summary?productIds=${ids}`),
    getJson<ReviewPage>(`/reviews?${listParams.toString().replace(/%2C/g, ',')}`),
    input.signedIn
      ? getJson<ReviewViewerState>(`/reviews/viewer?productIds=${ids}`, true)
      : Promise.resolve(null),
  ]);
  const own = new Set(viewer?.ownReviews.map((review) => review.id));
  const voted = new Set(viewer?.helpfulReviewIds);
  const editHref = (productId: string) => {
    const slug = input.productSlugs?.get(productId);
    return slug ? `/products/${encodeURIComponent(slug)}/review` : undefined;
  };
  const view = (review: ReviewResponse): CustomerReview => ({
    id: review.id,
    productId: review.productId,
    author: review.authorName,
    rating: review.rating,
    title: review.title,
    date: brasiliaDay.format(new Date(review.createdAt)),
    country: 'Brasil',
    variant: input.variantOptions?.get(review.productId) ?? [],
    verified: review.verifiedPurchase,
    body: review.body,
    helpfulCount: review.helpfulCount,
    own: own.has(review.id),
    votedHelpful: voted.has(review.id),
    ...(own.has(review.id) ? { editHref: editHref(review.productId) } : {}),
  });
  return {
    summary: summary ? summaryView(summary) : null,
    media: [],
    reviews: list?.items.map(view) ?? [],
    total: list?.total ?? 0,
    pageSize: REVIEWS_PAGE_SIZE,
    query: input.query,
    signedIn: input.signedIn,
    hasOwnReview: Boolean(
      viewer?.ownReviews.some((review) => review.productId === input.productId),
    ),
    unavailable: !summary || !list,
  };
}

/** The signed-in user's review of a product (write-review page). null = the API
 * could not answer; 'not-found' = unknown product; 'signed-out' = session gone. */
export async function fetchOwnReview(
  productId: string,
): Promise<OwnReviewResponse | 'not-found' | 'signed-out' | null> {
  try {
    const response = await fetch(
      `${apiBase()}/reviews/mine?productId=${encodeURIComponent(productId)}`,
      { headers: { cookie: cookies().toString() }, cache: 'no-store' },
    );
    if (response.status === 404) return 'not-found';
    if (response.status === 401) return 'signed-out';
    return response.ok ? ((await response.json()) as OwnReviewResponse) : null;
  } catch {
    return null;
  }
}

/** Catalog records with their per-product rating, for product cards. */
export async function withRatings<T extends CatalogItem>(items: T[]) {
  if (!items.length) return items;
  return attachRatings(
    items,
    await fetchRatingSummaries(
      items.map((item) => item.id),
      `${apiBase()}/reviews/summaries`,
    ),
  );
}
