# Current state

Last updated: 2026-09-24

This records observed local results, not an assertion that CI or deployment passed.

## Verified working

- Frozen pnpm install, Prisma client generation and shared package builds.
- Workspace lint, typecheck, unit tests and production builds passed after
  integrating homepage work with origin/main's account dropdown/hub.
- Unit tests: config-schema 13, API 12, storefront 11 (36 total).
- Storefront production build completes with the new account destinations.
- OpenAPI regenerated successfully; docs/openapi.json has no diff.
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

## Scope and limitations

- Homepage uses the existing local catalog-mock, not an API product feed.
  The 20 original IDs, names, prices, ratings and review counts are preserved.
  Photos and curated collections enrich those records; four products still use
  the existing illustration fallback. No backend/contract/schema change.
- Product listing/details, cart, checkout and orders remain feature-disabled.
  A responding route is not evidence of a working purchase flow.
- Authentication and the account hub/dropdown from main are preserved. A full
  signed-in browser flow was not repeated during PR preparation.
- The header/footer are shared with /account. Account-specific code and styles
  are retained; the shared visual changes also appear there.
- New carousel interactions were exercised through temporary Playwright scripts,
  but have no committed runner tests yet.
- Existing demo prices use decimal numbers. Converting this mock to integer
  minor units is separate work required before real catalog integration.

## Not verified in this run

- Database integration tests and destructive shadow-database drift checks.
  The check skill requires explicit confirmation before database-writing checks;
  never use the local development database as the shadow database.
- Docker image builds, Kubernetes deployment, migration Job and ingress smoke.
- Current GitHub CI outcome. Local checks are not a substitute for CI results.

## Known environment warnings

- Existing favicon.ico request returns 404.
- Vite CJS and Node util._extend deprecation warnings; checks still pass.

## Enabled features

Only home and authentication are enabled in config/features.yaml. Checkout
renders 404; other unimplemented destinations render Coming Soon. The account
hub is part of the authenticated shell and does not enable account management.
