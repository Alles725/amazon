/**
 * The integration boundary between Developer 1 (API) and Developer 2 (storefront).
 *
 * The storefront depends on this package and on the generated OpenAPI document.
 * It MUST NOT import anything from `apps/api`. Any change here must ship in the
 * same commit as the backend change and the regenerated OpenAPI artifact.
 */

export const API_PREFIX = '/api/v1';

/** Stable, machine-readable error codes. Messages are for humans and may change. */
export const ErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_ALREADY_REGISTERED: 'AUTH_EMAIL_ALREADY_REGISTERED',
  AUTH_SESSION_REQUIRED: 'AUTH_SESSION_REQUIRED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  CART_ITEM_UNAVAILABLE: 'CART_ITEM_UNAVAILABLE',
  CART_LIMIT_EXCEEDED: 'CART_LIMIT_EXCEEDED',
  // Account area: lists
  LIST_LIMIT_EXCEEDED: 'LIST_LIMIT_EXCEEDED',
  LIST_DEFAULT_PROTECTED: 'LIST_DEFAULT_PROTECTED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface ApiErrorBody {
  error: {
    code: ErrorCode | string;
    message: string;
    requestId: string;
    /** Present only for VALIDATION_FAILED. */
    details?: Array<{ field: string; message: string }>;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface IdentifyRequest {
  email: string;
}

/**
 * Deliberately reveals only whether the email is registered — nothing else
 * about the account. This is the minimum surface needed for the "sign in or
 * create an account" split screen; see AuthService.identify.
 */
export interface IdentifyResponse {
  exists: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface SessionResponse {
  user: UserProfile;
  expiresAt: string;
}

export interface LogoutResponse {
  success: true;
}

export interface HealthResponse {
  status: 'ok';
  service: string;
  version: string;
}

export interface ReadinessResponse {
  status: 'ready' | 'not-ready';
  checks: Record<string, 'ok' | 'failed'>;
}

/** Money crosses the wire as integer minor units plus an ISO 4217 currency. */
export interface Money {
  amountMinor: number;
  currency: string;
}

export const AUTH_ROUTES = {
  register: `${API_PREFIX}/auth/register`,
  login: `${API_PREFIX}/auth/login`,
  logout: `${API_PREFIX}/auth/logout`,
  me: `${API_PREFIX}/auth/me`,
  identify: `${API_PREFIX}/auth/identify`,
  protectedExample: `${API_PREFIX}/protected/example`,
} as const;

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) return false;
  const error = (value as { error?: unknown }).error;
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}

/** Catalog data is authoritative; prices and totals are integer minor units. */
export interface CatalogItem {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  priceMinor: number;
  currency: string;
  active: boolean;
  availableQuantity: number;
  inStock: boolean;
}

/** Product details expose only information currently stored by catalog. */
export interface CatalogProductDetails extends CatalogItem {
  categories: Array<{ slug: string; name: string }>;
  /** Breadcrumb: root → leaf ancestor chain of the product's most specific category. */
  categoryPath: Array<{ slug: string; name: string }>;
}

export interface CatalogPage {
  items: CatalogItem[];
  total: number;
}

export interface CartItemResponse {
  productId: string;
  product: CatalogItem;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
}

export interface CartResponse {
  id: string | null;
  userId: string;
  lines: CartItemResponse[];
  itemCount: number;
  subtotalMinor: number;
  currency: string;
}

export interface AddCartItemRequest {
  productId: string;
  quantity: number;
}
export interface UpdateCartItemRequest {
  quantity: number;
}
export const MAX_CART_QUANTITY = 99;
export const CART_ROUTES = {
  current: `${API_PREFIX}/cart`,
  items: `${API_PREFIX}/cart/items`,
} as const;
export const CATALOG_ROUTES = { products: `${API_PREFIX}/catalog/products` } as const;

// ---------------------------------------------------------------------------
// Catalog browse & search (BROWSE-001): listing filters, category tree, facets.
// ---------------------------------------------------------------------------

/** `relevance` ranks text matches first; without `q` it is alphabetical (the old default). */
export const CATALOG_SORTS = ['relevance', 'price-asc', 'price-desc', 'newest'] as const;
export type CatalogSort = (typeof CATALOG_SORTS)[number];
export const CATALOG_MAX_PAGE_SIZE = 48;
export const CATALOG_SEARCH_MAX_LENGTH = 100;
/** Upper bounds (integer minor units) of the price facet buckets; the last bucket is open. */
export const CATALOG_PRICE_BOUNDS_MINOR = [5000, 10000, 20000, 50000, 100000, 200000] as const;

/** Query of GET /catalog/products. Every filter narrows the result (AND). */
export interface CatalogListQuery {
  page?: number;
  pageSize?: number;
  /** Category slug; includes the whole subtree. */
  category?: string;
  slugs?: string[];
  /** Case- and accent-insensitive text search over name, description and category names. */
  q?: string;
  sort?: CatalogSort;
  /** Inclusive lower bound, integer minor units. */
  minPriceMinor?: number;
  /** Exclusive upper bound, integer minor units. */
  maxPriceMinor?: number;
  /** Only products with unreserved stock. */
  inStock?: boolean;
}

/** One node of the category taxonomy (flat list; the tree is rebuilt from `parentSlug`). */
export interface CatalogCategoryNode {
  slug: string;
  name: string;
  parentSlug: string | null;
}

export interface CatalogPriceBucket {
  minMinor: number;
  /** Exclusive; null for the open-ended last bucket. */
  maxMinor: number | null;
  count: number;
}

/** Scope of GET /catalog/facets: the listing filters that define "the result". */
export type CatalogFacetsQuery = Pick<CatalogListQuery, 'q' | 'category' | 'slugs'>;

/** Counts over the search scope (q + category + slugs). Refinements (price, stock) do not
 * change them, so choosing one never hides the alternatives. */
export interface CatalogFacets {
  total: number;
  inStock: number;
  priceBuckets: CatalogPriceBucket[];
  /** Active products per category, counting each category's whole subtree. */
  categories: Array<{ slug: string; count: number }>;
  /** Slugs of the matched products, so presentation-only facets (brand) can be derived. */
  slugs: string[];
  /** True when `slugs` was capped (more matches than CATALOG_FACET_SLUG_LIMIT). */
  slugsTruncated: boolean;
}
export const CATALOG_FACET_SLUG_LIMIT = 1000;

export const CATALOG_BROWSE_ROUTES = {
  categories: `${API_PREFIX}/catalog/categories`,
  facets: `${API_PREFIX}/catalog/facets`,
} as const;
// --------------------------- end catalog browse ----------------------------

export interface AddressInput {
  recipient: string;
  postalCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  /** DDD + número, digits only (10 or 11). Empty clears it. */
  phone?: string;
  /** Free text for the courier. Omitted on update keeps the stored value; empty clears it. */
  deliveryInstructions?: string;
}
export interface SavedAddress extends AddressInput {
  id: string;
}
export type SimulatedPayment = 'SIMULATED_CARD' | 'SIMULATED_PIX';
export interface CheckoutQuote {
  cart: CartResponse;
  /** Binds the cart lines, prices, payment method and discount rate that were quoted. */
  revision: string;
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  /** Payment method this quote was computed for (SIMULATED_CARD when none was given). */
  paymentMethod: SimulatedPayment;
  /** Whole percent applied to the subtotal (the Pix rate for SIMULATED_PIX, else 0). */
  discountPercent: number;
}
export interface PlaceOrderRequest {
  cartId: string;
  revision: string;
  addressId: string;
  paymentMethod: SimulatedPayment;
}
export interface OrderLineResponse {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  currency: string;
}
export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FULFILLED';
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  shippingAddress: AddressInput | null;
  paymentMethod: SimulatedPayment | null;
  placedAt: string;
  /** ISO timestamp; null until the package is delivered. */
  deliveredAt: string | null;
  deliveryNote: string | null;
  lines: OrderLineResponse[];
}
export const CHECKOUT_ROUTES = {
  addresses: `${API_PREFIX}/addresses`,
  quote: `${API_PREFIX}/orders/quote`,
  orders: `${API_PREFIX}/orders`,
  pricing: `${API_PREFIX}/orders/pricing`,
} as const;

// ---------------------------------------------------------------------------
// Checkout pricing: "X% de desconto à vista no Pix" (PIX-001)
// ---------------------------------------------------------------------------

/** GET /orders/quote?paymentMethod=... — omitted means SIMULATED_CARD (no discount). */
export interface CheckoutQuoteQuery {
  paymentMethod?: SimulatedPayment;
}

/**
 * Public pricing rules owned by the API configuration (checkout.pixDiscountPercent).
 * The storefront reads the rate here instead of hard-coding or re-reading config.
 */
export interface CheckoutPricing {
  /** Whole percent, 0-100. 0 means Pix has no discount. */
  pixDiscountPercent: number;
}

/**
 * The single rounding rule for percentage discounts, shared by the API (quote and
 * order transaction) and the storefront (advertised Pix price):
 *
 *   discountMinor = floor(amountMinor * percent / 100)
 *
 * Rounding down means the customer never gets more than the configured percent and
 * an advertised per-unit Pix price is never lower than what checkout charges.
 * Integer inputs only (money is integer minor units; the rate is a whole percent).
 */
export function percentDiscountMinor(amountMinor: number, percent: number): number {
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0)
    throw new RangeError('amountMinor must be a non-negative safe integer');
  if (!Number.isInteger(percent) || percent < 0 || percent > 100)
    throw new RangeError('percent must be a whole number between 0 and 100');
  const scaled = amountMinor * percent;
  if (!Number.isSafeInteger(scaled)) throw new RangeError('amountMinor is too large');
  return (scaled - (scaled % 100)) / 100;
}

/** Rate that applies to a payment method under the given pricing rules. */
export function paymentDiscountPercent(
  paymentMethod: SimulatedPayment,
  pricing: CheckoutPricing,
): number {
  return paymentMethod === 'SIMULATED_PIX' ? pricing.pixDiscountPercent : 0;
}

/** Amount charged when paying `amountMinor` with Pix (amount minus the rounded discount). */
export function pixPriceMinor(amountMinor: number, pricing: CheckoutPricing): number {
  return amountMinor - percentDiscountMinor(amountMinor, pricing.pixDiscountPercent);
}

// ---------------------------------------------------------------------------
// Customer reviews (REVIEWS-001). Owned by the Reviews module (REVIEWS_API).
// ---------------------------------------------------------------------------

/** Error codes specific to reviews; same wire format as ErrorCode. */
export const ReviewErrorCode = {
  /** A customer cannot vote their own review as helpful. */
  REVIEW_SELF_VOTE: 'REVIEW_SELF_VOTE',
} as const;
export type ReviewErrorCode = (typeof ReviewErrorCode)[keyof typeof ReviewErrorCode];

/** Validation limits shared by the API DTOs and the write-review form. Lengths
 * are counted after trimming. */
export const REVIEW_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  bodyMin: 10,
  bodyMax: 5000,
  /** Products per list/summary request (a variant family fits comfortably). */
  productIdsMax: 24,
  /** Products per batched card summary request (one catalog page). */
  summariesMax: 48,
  pageSizeMax: 20,
} as const;

export type ReviewSort = 'helpful' | 'recent';

export interface ReviewResponse {
  id: string;
  productId: string;
  /** Public name ("Camila S."), never the e-mail. */
  authorName: string;
  rating: number;
  title: string;
  body: string;
  /** The author had a non-cancelled order with this product when writing/editing. */
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPage {
  items: ReviewResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RatingBucket {
  stars: number;
  /** Rounded share of all ratings with this many stars. */
  percent: number;
}

/** Aggregate over the requested products. Empty = { average: null, count: 0 }. */
export interface RatingSummary {
  average: number | null;
  count: number;
  /** 5 stars first. null when part of the aggregate has no known distribution. */
  distribution: RatingBucket[] | null;
}

export interface ProductRatingSummary {
  productId: string;
  average: number | null;
  count: number;
}

export interface ProductRatingSummaries {
  items: ProductRatingSummary[];
}

/** Creates the caller's review of the product, or updates it (one per product). */
export interface SaveReviewRequest {
  productId: string;
  rating: number;
  title: string;
  body: string;
}

export interface OwnReviewResponse {
  review: ReviewResponse | null;
  /** Whether a review saved now would carry "Compra verificada". */
  verifiedPurchase: boolean;
}

/** What the signed-in viewer has done on the given products' reviews. */
export interface ReviewViewerState {
  ownReviews: Array<{ id: string; productId: string }>;
  helpfulReviewIds: string[];
}

export interface HelpfulVoteResponse {
  reviewId: string;
  helpfulCount: number;
  voted: true;
}

export const REVIEW_ROUTES = {
  reviews: `${API_PREFIX}/reviews`,
  summary: `${API_PREFIX}/reviews/summary`,
  summaries: `${API_PREFIX}/reviews/summaries`,
  viewer: `${API_PREFIX}/reviews/viewer`,
  mine: `${API_PREFIX}/reviews/mine`,
  helpful: (reviewId: string) => `${API_PREFIX}/reviews/${encodeURIComponent(reviewId)}/helpful`,
} as const;

// ---------------------------------------------------------------------------
// Account area ("Sua conta"): addresses management, access & security, lists.
// ---------------------------------------------------------------------------

/** A saved address as the account area sees it. Checkout keeps using
 * SavedAddress; lists come back default first, then oldest first. */
export interface AccountAddress extends SavedAddress {
  isDefault: boolean;
}

export interface UpdateProfileRequest {
  displayName: string;
}
/** Requires the current password; other sessions of the account are revoked. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
export interface ChangePasswordResponse {
  success: true;
  /** How many other signed-in sessions were ended. The current one is kept. */
  revokedSessions: number;
}
/** Requires the current password; other sessions of the account are revoked. */
export interface ChangeEmailRequest {
  email: string;
  currentPassword: string;
}
/** Same rule as registration. */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;
export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 80;

export const ACCOUNT_ROUTES = {
  profile: `${API_PREFIX}/account/profile`,
  password: `${API_PREFIX}/account/password`,
  email: `${API_PREFIX}/account/email`,
} as const;

export const DEFAULT_LIST_NAME = 'Lista de desejos';
export const LIST_NAME_MAX_LENGTH = 50;
export const MAX_LISTS_PER_USER = 20;
export const MAX_ITEMS_PER_LIST = 100;

export interface ListSummary {
  id: string;
  name: string;
  isDefault: boolean;
  itemCount: number;
  createdAt: string;
}
export interface ListItemResponse {
  productId: string;
  addedAt: string;
  /** Live catalog data (price, stock), read through the catalog boundary. */
  product: CatalogItem;
}
export interface ListDetails extends ListSummary {
  /** Newest first. Products that no longer exist in the catalog are omitted. */
  items: ListItemResponse[];
}
export interface ListNameRequest {
  name: string;
}
export interface AddListItemRequest {
  productId: string;
}
export const LIST_ROUTES = {
  lists: `${API_PREFIX}/lists`,
} as const;
