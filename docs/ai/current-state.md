# Current state

Last updated: 2026-09-24

This records observed local results, not an assertion that CI or deployment passed.

## Verified working

- Frozen pnpm install, Prisma client generation and shared package builds.
- Workspace lint, typecheck, unit tests and production builds passed after
  implementing the persistent cart on the current main branch.
- Unit tests: config-schema 13, API 12, storefront 18 (43 total).
- Storefront production build completes with the cart enabled locally.
- OpenAPI regenerated successfully with catalog/cart paths and shared response DTOs.
- All three Kustomize overlays render: local, development and production.
- Local PostgreSQL container, API on port 3001 and storefront on port 3000.
  API /health and /ready return success, including the database check.
- Local migrations and seed ran during homepage setup. This does not establish
  migration/schema drift parity or validate the API integration suite.
- Chromium checks after merging: homepage at 320–1920 px, local photos,
  horizontal scrolling, keyboard arrows, disabled end controls, search query
  submission, product links, footer links and back-to-top.
- All 20 mock product URLs and 22 footer routes respond. Login/register,
  cart/orders and account navigation respond; unauthenticated /account redirects
  to /login, and /api/v1/auth/me returns the expected 401.
- No browser JavaScript errors or new console errors in those checks.
  Header/upper section geometry and footer links match the earlier visual
  baseline; React comment markers were excluded from HTML comparisons.

## Persistent cart — 2026-09-24

- `/cart` implements empty, loading, error and populated states using the existing
  header/footer, session and database tables. No schema migration needed.
- Authenticated cart endpoints add/update/remove/clear and calculate current
  catalog prices in integer minor units. A minimal public catalog read supplies
  the existing database products for the cart's product selection.
- Catalog and cart ownership stay behind CATALOG_API/CART_API. No client prices
  or user IDs are accepted. Concurrent first additions serialize per account.
- 19 database integration tests pass (12 auth, 7 cart), including a run limited
  to two database connections with six simultaneous additions.
- 7 new frontend provider tests pass, covering old read responses, failed writes,
  account changes, expired sessions and refreshes queued during writes.
- Chromium verified the full cart lifecycle, reload persistence, homepage count,
  two-tab sync, retry behavior and responsiveness at seven widths (320–1920 px).
  No unexpected browser JS/console errors. Deliberate 503/401 injections were
  tested separately; they are expected failure-path checks.
- Existing homepage geometry, content sections and footer destinations still pass
  their visual regression checks. The header markup intentionally gains a live count.
- Cart defaults off in shared config and on in the ignored local FEATURES_FILE.
  See `docs/cart.md` for setup, endpoints and remaining limitations.
- Real catalog products have no photos in the existing schema; cart uses an honest
  image-unavailable state. No fake ratings, recommendations or browsing history.

## Scope and limitations

- Homepage uses the existing local catalog-mock, not an API product feed.
  The 20 original IDs, names, prices, ratings and review counts are preserved.
  Photos and curated collections enrich those records; four products still use
  the existing illustration fallback. The homepage data source is unchanged.
- Product listing/details, checkout and orders remain feature-disabled. Cart is
  implemented and enabled in local configuration; its shipped flag stays false.
  A responding route is not evidence of a working purchase flow.
- Authentication and the account hub/dropdown are preserved. Cart browser checks
  use real authenticated sessions; the existing authentication integration suite
  now also passes against an isolated PostgreSQL database.
- The header/footer are shared with /account. Account-specific code and styles
  are retained; the shared visual changes also appear there.
- New carousel interactions were exercised through temporary Playwright scripts,
  but have no committed runner tests yet.
- Existing demo prices use decimal numbers. Converting this mock to integer
  minor units is separate work required before real catalog integration.

- PR review: internal `markConverted` and `findBySlug` methods lack direct tests;
  current HTTP cart workflows are covered. Cover these hooks before their future
  checkout/detail consumers are enabled.

## Not verified in this run

- Shadow-database drift checks were not run. Never use the development database
  as a disposable shadow database.
- Docker image builds, Kubernetes deployment, migration Job and ingress smoke.
- Current GitHub CI outcome. Local checks are not a substitute for CI results.

## Known environment warnings

- Existing favicon.ico request returns 404.
- Vite CJS and Node util._extend deprecation warnings; checks still pass.

## Enabled features

Only home and authentication are enabled in shared config/features.yaml; the
local ignored configuration also enables cart. Checkout
renders 404; other unimplemented destinations render Coming Soon. The account
hub is part of the authenticated shell and does not enable account management.
