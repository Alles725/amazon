/**
 * Application interface for session storage. AuthService and SessionGuard depend
 * on this token, not on SessionService, so the persistence choice (PostgreSQL
 * today, Redis later) stays swappable and unit tests need no database.
 */
export const SESSIONS_API = 'SESSIONS_API';

export interface IssuedSession {
  token: string;
  expiresAt: Date;
}

export interface ActiveSession {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

export interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface SessionsApi {
  issue(userId: string, meta?: SessionMeta): Promise<IssuedSession>;
  /** Returns null for unknown, expired and revoked tokens alike. */
  validate(token: string | undefined): Promise<ActiveSession | null>;
  revoke(token: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<number>;
  purgeExpired(): Promise<number>;
}
