import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** 256 bits of entropy, url-safe. Opaque: it carries no claims. */
export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Sessions are looked up by hash, and only the hash is persisted. SHA-256 is
 * correct here (unlike for passwords): the token is already high-entropy, so
 * there is nothing to brute force, and lookups must stay fast.
 */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function tokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
