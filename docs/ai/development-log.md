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

## 2026-09-24 — CART-001

Implemented an authenticated, PostgreSQL-backed cart using the existing Cart and
CartItem schema. Added the minimum catalog read needed to select real products,
kept module boundaries, and extended api-contract/OpenAPI. Prices stay in integer
minor units, mutations derive identity from the existing session, and per-user
transaction locks protect concurrent increments/first-cart creation. Catalog reads
occur outside the lock transaction to avoid connection-pool starvation.

The cart page reuses header/navbar/footer, ProductCard/ProductImage and
HorizontalRail. It has empty/filled/loading/error states, quantity controls,
removal/clear, dynamic subtotals and header count, retry handling and tab syncing.
No homepage dataset replacement, schema change, dependency or fake checkout.
The existing real products have no photos; placeholders are explicit. Shared cart
flag remains false, with an ignored local config enabling it for demonstration.

Validation: 43 unit tests, 19 isolated-database integration tests, browser lifecycle
and failure-path checks, two-tab sync, seven responsive widths and homepage visual
regression checks. Full auth integration remains green. See current-state.md and
docs/cart.md for build/contract evidence and limitations. Browser test accounts are
temporary; the normal development database is never reset.

Final checks for CART-001: frozen install, Prisma generation, all shared builds,
workspace lint/typecheck/unit tests and production builds passed. OpenAPI regenerated
and all three Kustomize overlays rendered. No Docker image/deployment or drift run.


## 2026-09-25 — PRODUCT-001

Implemented dynamic product details by UUID/slug with the existing catalog,
inventory and category tables. Extended the shared contract/OpenAPI with a public,
read-only detail endpoint; inactive/absent products return standard 404 errors.
Reused storefront header/navbar/footer, product cards, image fallback and rails.
Added responsive three-column presentation, specifications and related categories.
CartProvider accepts a chosen quantity with a backward-compatible default of one;
real cart cards and item titles now link to details. Checkout remains unavailable.

No schema/auth/dependency changes, fabricated reviews/deals, or reassignment of
mock photos. The gallery is implemented and tested with fixtures, but current
catalog records lack images; the live page honestly shows image unavailable.
The new feature remains disabled in shared config, enabled in ignored local config.

Validation: frozen install, Prisma generation, shared builds, workspace lint/types,
51 unit tests, production builds, OpenAPI generation and three overlays passed.
22 integration tests passed against a disposable database, removed afterward.
Browser: four real products, ID/slug/related links, selected quantities, cart
product/subtotal/header and reload; eight widths without overflow. Fixed a React
sibling-key warning identified by this run. Rechecked the existing cart lifecycle,
homepage baseline in six widths and 22 footer routes; no new normal-flow errors.
No drift, Docker image build or deployment. Work is on feat/product-details,
based on the previously published cart commit 464f044 (PR #10).


## 2026-09-25 — PRODUCT-001 follow-up: unify demo and database products

Diagnosed two disconnected catalogs: homepage-only p1–p20 records and four seeded
PostgreSQL products. The detail template had no four-ID whitelist. Moved existing
demo data to config/demo-products.json and added idempotent seed:demo registration
in the existing Product/Inventory schema, preserving slugs and assigning real UUIDs.
Demo stock is explicit fixture data (10), never a default for missing inventory.
The import does not overwrite any existing product or inventory changes.

All products resolve via the same UUID/slug lookup and authenticated cart. Optional
fixture presentation uses SKU+slug; current price/name/stock stay API-authoritative.
Added neutral description/review/photo/specification/discount fallbacks. Inactive
products now open via direct links but remain unavailable for cart additions.
No schema/migration/dependency or authentication change.

Validation: 56 unit tests, 26 isolated PostgreSQL integrations, workspace lint/types,
production builds, deterministic OpenAPI and three manifests passed. Integration
covers every demo in the cart, incomplete arbitrary products, UUID-shaped slugs,
inactive/missing inventory and seed reruns preserving edits. Browser checked 27
records, 20 homepage links, 25 available products in one cart with exact subtotal,
count/reload and responsive photo/placeholder cases without new errors. Temporary
users/products/database removed; the 20 demo catalog records intentionally remain.


PR preparation for PRODUCT-001: moved the reviewed changes onto a new branch,
feat/unified-product-pages, based on origin/main at 3b2419f. The cart PR #10 is
already merged. A local Finder metadata checkout conflict was preserved via a
backup outside the repository; no application code conflicted. Re-ran frozen
install, Prisma generation, shared builds, lint/types, 56 unit tests, production
builds, OpenAPI and all overlays successfully. Integration/browser results above
remain applicable to the same code; they were not needlessly repeated here.
Review found no blockers. Commit/push/PR await final create-pr approval.
