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
