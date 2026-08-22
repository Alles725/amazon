# 0004 — Opaque server-side sessions in PostgreSQL

Status: provisional (2026-01)

## Context
The MVP needs authentication that survives API restarts, can be revoked
immediately, and does not require new infrastructure.

## Decision
Random 256-bit opaque tokens in an HttpOnly cookie. Sessions are stored in
PostgreSQL, and only a SHA-256 hash of the token is persisted. Passwords use
Argon2id. A globally registered guard protects every route unless it opts out
with `@Public()`.

## Benefits
- Immediate revocation on logout — impossible with stateless JWTs.
- No Redis to operate at this stage; sessions survive restarts.
- A database leak does not yield usable session tokens.
- Fail-closed by default: forgetting a decorator leaves a route protected, not open.

## Trade-offs
- One database round-trip per authenticated request.
- Session cleanup needs a periodic job as volume grows.

## Why SHA-256 for tokens but Argon2id for passwords
Passwords are low-entropy and must be slow to brute force. Session tokens are
already 256 bits of randomness, so there is nothing to brute force, and lookups
must stay fast.

## Revisit when
Session lookups become a measurable bottleneck (move storage to Redis behind the
existing `SessionsApi` interface), or when cross-domain clients need tokens.
