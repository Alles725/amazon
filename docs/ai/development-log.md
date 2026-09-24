# Development log

Append one entry per completed story. Newest last.

## 2026-08-14 — SKELETON-BOOTSTRAP

Changes:
Generated the full skeleton in one pass: pnpm workspace; `packages/config-schema`
(Zod schemas, layered YAML/env loader, FeatureRegistry) and
`packages/api-contract` (error codes, DTO types, route constants); NestJS API
with request-context logging, global error filter, health/readiness, Argon2id
passwords and PostgreSQL-backed opaque sessions; Prisma schema for all ten
tables; Next.js storefront with eleven routes, design-system primitives and
feature-gated routing; two Dockerfiles; Kubernetes base plus three Kustomize
overlays; Makefile, CI and smoke test; six ADRs.

Tests:
config-schema 13/13, api unit 11/11, storefront 11/11, `next build` succeeds,
`kustomize build` succeeds for all three overlays. API integration suite (13
cases) written but not executed — no PostgreSQL available.

Architecture impact:
Extracted `SessionsApi` (`SESSIONS_API`) so `AuthService` and `SessionGuard`
depend on an interface rather than the concrete `SessionService`. This matches
the `USERS_API` convention, keeps the session store swappable, and removed the
database from the unit-test graph.

Database impact:
Initial migration `20260101000000_init` written **by hand** because the Prisma
engine CDN was unreachable. Unverified. `drift:check` added to the database
package and to CI to catch divergence from `schema.prisma`.

Configuration impact:
`config/features.yaml` is the single source of truth, consumed by the storefront
and mounted into the cluster via a Kustomize `configMapGenerator`. Reading it from
above the kustomization root requires `--load-restrictor LoadRestrictionsNone`,
so deployment pipes `kustomize build` into `kubectl apply` instead of `apply -k`.

Kubernetes impact:
Fixed a defect that would have broken every deployment: `namespace:` was declared
only in `base`, so Secrets generated in an overlay were namespace-less and the
name-reference transformer left consumers pointing at the unhashed `api-secret`.
Pods would have failed with `CreateContainerConfigError`. `namespace:` is now
declared in every overlay.

Follow-up:
1. Run `drift:check` before trusting the migration SQL.
2. Generate and commit `docs/openapi.json`; CI fails until it exists.
3. First cluster run (`FIRSTRUN-001` in backlog.yaml) — nothing has been deployed.

## 2026-09-24 — HOME-VISUAL-001

Refined the homepage in three stages: compact header and promotional mosaic;
reusable horizontal product/category rails and curated collections; denser final
shelves and dark footer with explicit Arial/Helvetica typography. Added local
photos with source records. Existing mock IDs/prices/ratings and route links are
retained. No API, database, contract, feature-flag or dependency changes.

Integrated with origin/main's newer account dropdown/hub without overwriting its
code or account-specific styling. Shared header/footer styling also affects that
page. Preserved local skill files outside this visual PR.

Validation after integration: frozen install, Prisma generation, shared builds,
workspace lint/typecheck, 36 unit tests, production builds, OpenAPI generation
with no diff, and all three Kustomize overlays passed. Local health/readiness
passed with PostgreSQL. Chromium checks covered 320–1920 px, image loading,
scroll/keyboard controls, search, 20 product URLs, 22 footer destinations,
login/register/cart/orders navigation and back-to-top. Upper homepage geometry
matches the pre-footer baseline; React comment-only markup changes are ignored.
No new browser console or JavaScript errors; existing favicon 404 remains.

Not rerun: signed-in end-to-end flow, database integration/drift, Docker image
builds, Kubernetes deployment or ingress smoke. No committed carousel tests yet;
temporary Playwright scripts were used. Mock catalog and disabled purchasing
features are pre-existing limitations, not newly implemented commerce.
