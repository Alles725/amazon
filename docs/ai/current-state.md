# Current state

Last updated: 2026-09-29

This records observed local results, not an assertion that CI or deployment passed.

## Verified working

- Frozen pnpm install, Prisma client generation and shared package builds.
- Workspace lint, typecheck, unit tests and production builds passed after
  implementing the product detail page on feat/product-details.
- Unit tests: config-schema 13, API 12, storefront 31 (56 total).
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
  image-unavailable state. No fake ratings or recommendations; browsing history
  is only ever recorded from real visits (see Header navigation, 2026-09-29).

## Product detail — initial pass, 2026-09-25

- Public ID/slug lookup, active products only, categories and available inventory.
  Existing schema and authentication unchanged; shared contract and OpenAPI updated.
- Three-column detail layout, compact specifications and category-based rails.
  Existing header/footer/cards/rail reused; unavailable fields are omitted.
- Cart addition accepts chosen quantity, defaults to one for existing callers,
  and keeps header count/persistence. Real cart cards/items link to details.
- 22 isolated PostgreSQL integrations pass (12 auth, 7 cart, 3 catalog).
- Eight new frontend tests cover gallery selection/image failure, absent photos,
  chosen quantity, cart limits and disabled/guest/loading/error states.
- Chromium passes four products, ID/slug, related links, quantities, correct cart
  product/subtotal/count, reload, not-found UI and eight widths (320–1920 px).
  A duplicate React key discovered during testing was fixed before the final run.
- Existing cart lifecycle and homepage baseline/22 footer destinations rechecked.
  No new console/JS errors in normal flows; original favicon/toolchain warnings remain.
- Full check sequence, OpenAPI generation, Kustomize overlays and local readiness pass.
- No photo metadata exists. Gallery receives no images in the live page; thumbnail
  switching is tested with fixtures only. Checkout remains explicitly disabled.
  See docs/product-details.md. No additional seed/migration was needed.

## Unified product sources — 2026-09-25

- Root cause of broken p1–p20 links: homepage-only fixtures were absent from the
  database, which contained just four seed products. No per-product page whitelist.
- Moved demo records to config/demo-products.json, consumed by both homepage and
  the seed. seed:demo inserts missing records with stable slugs, database UUIDs,
  integer prices and explicit demo inventory, never overwriting existing records.
- All 24 permanent products now open in the same dynamic template and use the same
  authenticated cart. New arbitrary records do not depend on the fixture list.
- Optional demo images/previous price match SKU+slug. API identity/name/price/stock
  remain authoritative. Missing metadata has safe fallbacks; ratings are not fabricated.
- Inactive records remain viewable by direct links with purchase disabled; missing
  inventory also means unavailable. The active-only catalog listing is unchanged.
- 56 unit tests, 26 isolated PostgreSQL integrations, complete check sequence,
  production builds, OpenAPI and three Kustomize overlays passed.
- Browser opened 27 records (24 permanent, three temporary), verified 20 homepage
  links and 25 available products in one persisted cart with exact subtotal/count.
  Photo and placeholder cases passed four responsive widths without new errors.
- Temporary browser users/products and integration database removed. The 20 demo
  products intentionally remain. Shared flags stay false; local override stays on.

## Scope and limitations

- Homepage keeps its curated demo presentation from shared fixtures, not a live
  API feed. Its 20 stable IDs now resolve to database slugs; details and cart use
  persisted UUIDs and current prices. Demo review counts remain homepage-only.
- Product listing and the orders list page remain placeholders. Checkout, product
  details and cart are implemented and enabled locally; shipped flags stay false.
  A responding route is not evidence of a working purchase flow.
- Authentication and the account hub/dropdown are preserved. Cart browser checks
  use real authenticated sessions; the existing authentication integration suite
  now also passes against an isolated PostgreSQL database.
- The header/footer are shared with /account. Account-specific code and styles
  are retained; the shared visual changes also appear there.
- New carousel interactions were exercised through temporary Playwright scripts,
  but have no committed runner tests yet.
- Shared demo fixture prices are integer minor units. Homepage presentation
  converts to major units only for its pre-existing formatting helpers.

- PR review: internal `markConverted` and `findBySlug` methods lack direct tests;
  current HTTP cart workflows are covered. Cover these hooks before their future
  consumers are enabled. The new detail route uses the integration-tested
  getProduct method instead.

## Not verified in this run

- Checkout drift checks passed using an isolated disposable shadow database.
- Docker image builds, Kubernetes deployment, migration Job and ingress smoke.
- Current GitHub CI outcome. Local checks are not a substitute for CI results.

## Known environment warnings

- Existing favicon.ico request returns 404.
- Vite CJS and Node util._extend deprecation warnings; checks still pass.

## Enabled features

Only home and authentication are enabled in shared config/features.yaml; the
local ignored configuration also enables cart, productDetails and checkout.
Unimplemented destinations render Coming Soon. The account
hub is part of the authenticated shell and does not enable account management.

## Academic checkout — 2026-09-26

- Reuses CartProvider, session cookies and existing Order/OrderItem tables.
- Adds saved addresses and immutable order address/payment/cost snapshots through
  migration 20260926000000_checkout, preserving previous data. Applied locally;
  schema/migration drift verified in a disposable shadow database.
- Prices and quantities validated server-side. One transaction locks the cart,
  checks/decrements inventory, persists order/items and converts/empties the cart.
  Stale revisions fail; sourceCartId makes retries idempotent. No real card data.
- Two-column responsive checkout and persisted owner-only confirmation page.
  Existing product purchase panel links to checkout after adding the product.
- Details and operational limitations: docs/checkout.md. No production deployment.
- Validation: 62 unit tests (13 configuration, 12 API, 37 storefront) and 35
  isolated PostgreSQL integration tests passed. Full lint/typecheck/build,
  OpenAPI generation and all three Kustomize overlays passed.
- Browser: real login → product → cart → checkout → confirmed order → empty cart;
  required fields, saved-address create/edit/select, both simulated payments,
  quantity/removal/reload, image/placeholder and 320–1920px layouts verified.
  Lost-response retry returned the same persisted order without duplicates.
- Database verified exact inventory/totals/snapshots. Temporary users, orders,
  addresses, products and integration database removed. Homepage geometry and
  22 footer destinations preserved. No new normal-flow console/backend/DB errors;
  deliberate failure tests and pre-existing toolchain/favicon warnings excluded.

## Header navigation and browsing history — 2026-09-29

- Navbar has exactly nine items: Todos, Venda na Amazon, Atendimento ao cliente,
  Comprar novamente, Ofertas do dia, Sua Amazon.com.br, Alimentos e Bebidas,
  Histórico de navegação, Ideias de Presente. "Livros" and "Eletrônicos" removed.
- "Todos" opens an Amazon-style left panel (5 sections, fixed external links).
  "Sair" is a no-op `javascript:void(0)` link by request; React logs a dev warning.
- Browsing history flyout behind the new `browsingHistory` flag (false in shared
  config). Product detail pages record real visits in the browser's localStorage;
  nothing is fabricated and there is no backend. History is per browser, not per
  account: people sharing a browser share it, like Amazon's signed-out history.
- Validation: storefront lint/typecheck and 46 unit tests pass. Chromium verified
  the navbar order, Todos open/close, the flyout at 1900px and 390px (carousel
  arrow scrolling, timeline dots centered under each product, hover/click/outside
  close). The flyout was exercised with history seeded from demo products: the
  running server had productDetails disabled, so recording from a real product
  page visit is covered by unit tests only. "No carrinho" badge unit-tested only.
- Production build compiled; the standalone output step failed locally with a
  Windows symlink EPERM unrelated to this change.
