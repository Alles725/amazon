import {
  HelpfulVoteResponse,
  OwnReviewResponse,
  ProductRatingSummaries,
  RatingSummary,
  ReviewPage,
  ReviewResponse,
  ReviewSort,
  ReviewViewerState,
  SaveReviewRequest,
} from '@amazon-mvp/api-contract';

export const REVIEWS_API = 'REVIEWS_API';

/** Reviews owns reviews, review_helpful_votes and review_rating_baselines. Product
 * existence comes from CATALOG_API, author names from USERS_API and "Compra
 * verificada" from ORDERS_API; it never reads those modules' tables. */
export interface ReviewsApi {
  list(query: {
    productIds: string[];
    sort: ReviewSort;
    stars?: number;
    page: number;
    pageSize: number;
  }): Promise<ReviewPage>;
  /** One aggregate over all the given products (a variant family). */
  summary(productIds: string[]): Promise<RatingSummary>;
  /** One aggregate per product (product cards). */
  summaries(productIds: string[]): Promise<ProductRatingSummaries>;
  viewerState(userId: string, productIds: string[]): Promise<ReviewViewerState>;
  /** null when the product does not exist. */
  findOwn(userId: string, productId: string): Promise<OwnReviewResponse | null>;
  saveOwn(userId: string, input: SaveReviewRequest): Promise<ReviewResponse>;
  markHelpful(userId: string, reviewId: string): Promise<HelpfulVoteResponse>;
}
