# Current state

Last updated: 2026-09-30

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
- Cart is enabled in the shared config since FLAGS-001.
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
- Product listing remains a placeholder (orders: see "Seus pedidos" below). Checkout, product
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

- /favicon.ico is not served; browsers use the /icon.svg link emitted by metadata.
- Vite CJS and Node util._extend deprecation warnings; checks still pass.

## Enabled features

Shared config/features.yaml enables home, authentication, sell, help, orders,
productDetails, cart, checkout and browsingHistory (FLAGS-001).
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
- Browsing history flyout behind the new `browsingHistory` flag (enabled in shared
  config since FLAGS-001). Product detail pages record real visits in the browser's localStorage;
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

## Venda na Amazon page — 2026-09-29

- /sell renders the Amazon seller landing page (bare route: Amazon header/footer
  only). Shared `sell` flag enabled; the page is static and has no backend.
- Content verbatim from the reference; external links point to venda.amazon.com.br,
  Seller Central registration and the Tons de Preta YouTube story, opened in a new tab.
- Images copied from Amazon's media CDN into public/images/sell (sources listed);
  font is Inter Tight under OFL, not Amazon's proprietary Ember.
- Validation: storefront lint/typecheck and 50 unit tests pass. Chromium verified
  desktop (compared against the reference screenshots) and 390px mobile, FAQ toggle,
  link targets, smooth back-to-top and no overflow. The FAQ toggle itself is native
  <details> behaviour and is not unit-tested (jsdom does not implement it).
- Production build compiled; the standalone output step failed locally with the
  same Windows symlink EPERM noted above.

## Atendimento ao Cliente page — 2026-09-29

- /help renders the customer service page (bare route: Amazon header/footer plus a
  customer-service bar). Shared `help` flag enabled.
- Recent products are read from GET /api/v1/orders for the signed-in user only;
  signed out, API failure or no orders → no product cards. Verified end to end with a
  disposable account and two real orders (data removed afterwards). Seed products have
  no demo SKU, so real cards currently show the "Imagem indisponível" placeholder.
- Help-library search filters topic cards client-side (accent/case-insensitive);
  topic cards link to existing routes, most of which are still Coming Soon.
- Validation: lint, typecheck, 58 storefront unit tests; Edge headless at 1770, 1280,
  1024 and 500px with no clipping or horizontal overflow. `next build` was not rerun
  for the final diff (it shares .next with the running dev server and the standalone
  step fails locally with the known Windows symlink EPERM).

## Browser tab title and favicon — 2026-09-29

- Root metadata title is "Amazon.com.br | Tudo pra você, de A a Z." for every route
  (no route defines its own title). The smoke test's home check expects this title.
- Favicon: apps/storefront/src/app/icon.svg (App Router file convention), the "a" and
  orange smile from the existing AmazonLogo colors; header/logo unchanged.
- Validation: lint, typecheck, 58 storefront unit tests. `next dev` and `next start`
  both serve the title and `<link rel="icon" href="/icon.svg?…">` (200, image/svg+xml)
  on /, /login, /help (plus /sell, /cart in dev). `next build` compiled and emitted
  /icon.svg; the standalone step failed with the known Windows symlink EPERM.

## Seus pedidos (order history) — 2026-09-29

- /orders ("Devoluções e Pedidos") and /orders/:id are bare routes with the shared
  Amazon header/footer. Signed out → /login. Shared `orders` flag enabled.
- Data: GET /api/v1/orders only, through features/orders/orders-server.ts, which is
  also the source for /help recent products and the Home "Seus pedidos" card (shown
  only to signed-in users with orders). No UI mocks.
- Migration 20260929000000_order_delivery adds nullable orders.delivered_at and
  delivery_note; checkout orders keep both null ("Pedido recebido"). Applied locally;
  drift check clean on a disposable shadow database. OpenAPI regenerated.
- Demo data: config/demo-orders.json holds one order (product p6, placed 2026-08-10,
  delivered 2026-08-17). `DEMO_ORDER_EMAIL=<existing account> pnpm --filter
  @amazon-mvp/database seed:demo-orders` persists it; reruns skip existing order
  numbers; never creates users.
- Year selector derives from order dates (only years with orders, newest first).
  "Comprar novamente" adds to the cart when the cart feature is on, otherwise opens
  the product page (cart is off in shared config).
- Validation: lint, typecheck, 71 storefront unit tests, 35 API integration tests on a
  disposable database. Edge via Playwright with a temporary (then deleted) session: 25
  checks incl. DB/UI parity, filters, search, tabs, details, /help and Home reuse,
  signed-out redirect and no horizontal overflow at 320/390/768/1024/1920px.
- Not verified: the Home card at every breakpoint beyond 1536px desktop; Edge logged
  "Extra attributes from the server: style" on the header search input only after the
  test had typed into forms in the same session (not reproducible on fresh loads of any
  page). `next build` compiled; standalone step hit the known Windows EPERM.

## Product detail page (Amazon layout) — 2026-09-29

- /products/[productId] rebuilt after the 8BitDo Ultimate 2C reference (3 screenshots): Prime
  alert, breadcrumb, "Você comprou…" banner, gallery + viewer, info column, variants, buy box,
  related rail, details, description, "Da marca" and customer reviews. One generic template;
  see docs/product-details.md for every data source and what stays demo-only.
- Migration 20260930000000_category_hierarchy (categories.parent_id). API returns categoryPath
  and ?category= includes the subtree; contract + docs/openapi.json regenerated. Applied locally;
  drift clean on a disposable shadow database.
- Demo data: p6 is now the 8BitDo Ultimate 2C Hortelã (seed upgrades it only if it still holds
  the old fixture values); p21–p23 are its Pêssego/Roxa/Verde siblings. New server-only fixtures:
  demo-product-content, demo-categories, demo-brands, demo-reviews. seed:demo ran twice locally
  (idempotent). 39 product images + 2 brand images copied locally (SOURCES.md next to them).
- Existing demo order 702-4418305-7719264 (p6) keeps its old snapshot name; the banner still
  matches it by product ID.
- Validation: lint, typecheck, unit tests (config-schema 13, API 12, storefront 106), 38 API
  integration tests on a disposable database, OpenAPI regenerated, three Kustomize overlays.
  `next build` compiled and generated all pages; the standalone step hit the known Windows EPERM.
- Browser (Edge via Playwright, temporary accounts deleted, stock restored): 27/27 end-to-end
  checks (add to cart, variant switch, gallery viewer, buy now → checkout → confirmed order,
  purchase banner on both variants, Ver pedido, out of stock, guest → login?next) and a 661-check
  audit of all 27 products by slug and UUID (title, <title>, price, breadcrumb, own images, stock,
  related links, console) plus 20 Home and 27 cart product links. 390/768/1440 px without
  horizontal overflow and without console errors.
- productDetails/cart/checkout stay false in the shared config (features.spec asserts it);
  verification used a local copy of features.yaml with them on. New flag productReviews (false,
  Coming Soon) backs "Escreva uma avaliação".
- Not verified: missing product returns HTTP 200 + noindex (global app/loading.tsx streams first);
  customer photo/video UI is unit-tested only (no customer media exists).

## Integration audit (Home → … → produto novamente) — 2026-09-29

- Found one duplicated source: Home cards printed name/price from config/demo-products.json
  while product page, cart and checkout read the catalog. Home now resolves each curated card
  to its catalog record (features/home/home-catalog.ts); inactive/missing records are omitted.
  Cards without photos keep their glyph. Visual check: same 9 rails and 48 cards, no overflow.
- Screens and their entity: product/cart/checkout = catalog record (UUID); success page,
  /orders, /orders/:id, Home orders card and /help = the persisted order and its item snapshot;
  product page banner = orders matched by product UUID. Images everywhere come from the same
  fixture (slug+SKU for catalog records, SKU for order snapshots).
- Browser journey with temporary DB prices (restored): Home → p6 → Roxa (p22) → cart ×2 →
  checkout → order → /orders → /orders/:id → Home orders card → /help → order → product:
  30/30 checks, same UUID/name/price/image on every screen, stock decremented once, cart
  emptied, no console errors. Temporary account and order deleted.
- Follow-ups recorded as planned stories in backlog.yaml iteration 13 (FLAGS-001, REVIEWS-001,
  BROWSE-001, NOTFOUND-001, PIX-001). backlog.yaml was invalid YAML on main (two quoted titles);
  fixed.

## Pre-PR review fixes — 2026-09-29

- Login `next`: whitespace/control characters now refused ("/	/evil.example" was an open
  redirect because browsers strip tabs/newlines); tests assert every result is same-origin.
- "Comprar agora" adds the chosen units like "Adicionar ao carrinho" (was: top-up to a total);
  with all stock already in the cart it opens checkout directly. Both covered by unit tests.
- Remaining review items recorded in backlog.yaml (CATALOG-BATCH-001, PDP-A11Y-001,
  PDP-META-001, CATALOG-PATH-001).

## Catalog expansion (CATALOG-002) — 2026-09-29

- Local database seeded: 150 products (23 original demo + 123 new + 4 base seed), 89
  categories, 160 category links, 150 inventory rows; no duplicated SKU/slug; orders and
  users preserved; 8BitDo family rows identical before/after. Seed rerun: identical counts.
- Executed: lint, typecheck, unit tests, 39 API integration tests (disposable DB, removed),
  OpenAPI regenerated, browser journey and a render check of all 147 product pages.
- Not executed: prisma generate while the local API on :3001 held the query engine DLL
  (schema unchanged); storefront standalone output (Windows EPERM on symlinks); Kustomize
  (not installed); Docker images. The API on :3001 still runs the old code and must be
  restarted for the Home's ?slugs= call.

## Shared feature flags (FLAGS-001) — 2026-09-29

- productDetails, cart, checkout and browsingHistory are on in config/features.yaml; the
  default `.env` (FEATURES_FILE=../../../config/features.yaml) serves the product page,
  cart, checkout and history flyout without a local copy.
- Verified in the browser with the default file: four products, unknown id, cart
  quantity/header count, related navigation, buy now → checkout, responsive widths and
  the history flyout ("No carrinho" badge now observed in a browser, not only unit tests).
- Still off: catalog (/products placeholder), account, productReviews and the
  footer/account-hub pages (Coming Soon).

## Footer institutional pages ("Conheça-nos" and "Ganhe dinheiro conosco") (FOOTER-001) — 2026-09-30

- The 12 "Conheça-nos" / "Ganhe dinheiro conosco" footer pages (except /sell, already
  done) are real content pages; flags about … advertise are on.
- Deliberately honest placeholders: press releases, job openings, financial reports,
  named projects/partners, papers and any enrolment form do not exist in this store.
- Known limitation: on phones the section nav scrolls sideways and the current page's
  link can start off-screen.

## Footer help and payment pages (FOOTER-002) — 2026-09-30

- Seven help/payment footer pages are real; flags paymentMethods, points, creditCard,
  shipping, returns, contentAndDevices and recalls are on.
- /payment-methods shows the signed-in user's recent orders (method and total).
- Not available in this store and said so on the page: loyalty points, the credit card,
  content/devices management, online returns/cancellations, delivery dates and tracking;
  the recall list is empty because no recall records exist.

## Pix discount (PIX-001) — 2026-09-30

- Pix discount is computed server-side in the quote and again in the order transaction;
  the rate comes from API config and reaches the storefront only through /orders/pricing.
- Limits: the rate is not stored on the order (details say "Desconto Pix" without the
  percentage); OpenAPI lists /orders/pricing under the session-protected tag although the
  endpoint is public; per-unit Pix prices can differ by a cent or two from the subtotal
  discount checkout charges.
