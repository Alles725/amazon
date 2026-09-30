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

## 2026-09-26 — CHECKOUT-001

Implemented Amazon-style academic checkout after inspecting cart/session/models
and docs/reference/Checkout. Reused existing Order/OrderItem, adding saved user
addresses, cost/address/payment snapshots and source-cart uniqueness through one
compatible migration. No real card input or payment gateway.

Orders orchestrates existing module interfaces in one database transaction for
authoritative prices, inventory checks, immutable order items and cart conversion.
Revision checks prevent silently buying an altered cart. Duplicate/lost-response
retries return the original order and preserve any subsequent cart.

Added two-column checkout, responsive address editor/selector, simulated card/Pix,
existing cart controls, dynamic summary and persisted owner-only confirmation.
Login returns to checkout through a fixed allowlisted destination. Product panel
exposes a checkout link for an item already in the cart when enabled.

Validation: 62 unit tests and 35 isolated database integrations pass, including
concurrent stock competition, duplicate confirmation and forced rollback. Full
install/generate/shared builds/lint/types/unit/build/OpenAPI/manifests passed;
local migration applied and isolated-shadow drift check passed. Browser exercised
complete real login-to-order flow, negative validation, address editing/selection,
qty/remove/reload, empty cart, both payment options, image and placeholder layouts,
and lost HTTP response recovery. Seven viewport widths, homepage regression and
22 footer routes passed. Direct DB checks confirmed quantities/totals/snapshots.
Temporary test data removed; normal-flow logs had no new application/DB errors.

Implementation initially completed without publication or deployment. A subsequent
create-pr request prepared feat/academic-checkout from updated main; publication
awaits final approval. Shared flags stay false;
local ignored config enables checkout alongside cart/productDetails. Application
left running locally. See docs/checkout.md for limits and operating details.

## 2026-09-29 — HEADER-NAV-001

Replaced the navbar items with the nine requested entries and turned "Todos" into
an Amazon-style slide-in menu (AllMenu, client component beside AccountMenu) with
the requested sections and links. Closes on outside click, close button and Escape.

Added the "Histórico de navegação" flyout from the Amazon reference: title, "Exibir
e editar" (remove items / clear), single-row carousel reusing HorizontalRail and
ProductImage, "No carrinho" badge from CartProvider, and a timeline with orange dots
and one date label per day. The project had no history data and forbids fabricated
history, so product detail pages record real visits in localStorage (no backend).
Gated by the new `browsingHistory` flag, disabled in shared config.

Validation: lint, typecheck and 46 storefront unit tests pass; Chromium checks at
1900px and 390px with demo-seeded history. See current-state.md for what was not
exercised end-to-end.

## 2026-09-29 — SELL-001

Implemented the "Venda na Amazon" page on /sell from the amazon.com.br reference
(PDF plus 75%-zoom screenshots of the live page). Sections in reference order: hero
band, stats, Tons de Preta story card, share stats, three benefit cards, eight-item
FAQ, sign-up CTA. Copy comes verbatim from the provided Markdown; link destinations
come from venda.amazon.com.br because the Markdown carried no URLs. Reference
imagery is stored locally (public/images/sell/SOURCES.md); Inter Tight (OFL) stands
in for Amazon Ember Display. Reuses AmazonHeader, which gained an optional
currentHref that marks the page's navbar item, and AmazonFooter unchanged.

Validation: storefront lint/typecheck and 50 unit tests pass (4 new). Chromium at
1890px (reference-matched) and 390px: FAQ opens/closes, 12 links resolve to their
reference destinations, back-to-top scrolls smoothly, no horizontal overflow, other
routes still 200. Production build compiled; standalone step hit the known Windows
symlink EPERM.

## 2026-09-29 — HELP-001

Implemented the "Atendimento ao Cliente" page on /help from three amazon.com.br
screenshots: teal "amazon customer service" bar, recent-products hero, two action
buttons, quick-links strip, help-library search and "Todos os tópicos de ajuda"
(11 categories as vertical tabs, 2-column cards), existing footer. Recent products
come only from the signed-in user's orders via the existing orders API (newest order
first, distinct products, at most six); order items carry no media, so the photo is
matched by SKU against the same fixtures the product page uses, else a placeholder.
Without orders the grid is omitted and the title becomes a greeting — no fabricated
items. The quick-links strip is an equal-column grid so no link is clipped.

Validation: workspace lint/typecheck and tests pass (storefront 58, 8 new). End to end
with a disposable account and two real orders: /help listed exactly those products in
order; account, orders and consumed stock were removed/restored afterwards. Edge
headless at 1770/1280/1024/500px: no clipping or horizontal overflow. Running
`next build` alongside `next dev` clobbers the shared .next (dev server lost its CSS);
the dev server was restarted with a clean .next and the root .env loaded.

## 2026-09-29 — TAB-001

Set the browser tab identity: root metadata title "Amazon.com.br | Tudo pra você, de
A a Z." and an SVG favicon via the App Router `app/icon.svg` convention. The Amazon
logo existed only as an inline React component, so the icon reuses its "a" and orange
smile/colors instead of a new design. Only one title source exists (root layout); the
smoke test's home assertion moved from the old "MVP Storefront" title to the new one.

Validation: storefront lint/typecheck and 58 tests pass. Title and icon link verified
in `next dev` and `next start`; /icon.svg returns 200 image/svg+xml and was rendered in
Edge headless at 16/32/160px. Production build compiled; standalone step hit the known
Windows symlink EPERM. The dev server was stopped for the build and restarted with a
clean .next and the root .env.

## 2026-09-29 — ORDERS-001

Implemented "Seus pedidos" on /orders (target of the header's "Devoluções e Pedidos")
from an amazon.com.br screenshot: breadcrumb, title with "Pesquisar todos os pedidos" /
"Buscar pedidos", tabs (Pedidos, Compre Novamente, Ainda não enviado), "N pedido(s)
feito(s) em" with a period selector, and order cards (grey header with date, total,
ship-to popover, order number, details and "Fatura"; delivery status, items, Amazon
pill buttons). /orders/:id replaces its placeholder with a real details page.

Everything reads the existing orders API; nothing is mocked in the UI. The only schema
change is nullable `delivered_at` / `delivery_note` on orders (additive migration), so
"Entregue no dia 17 agosto" and its note come from the database. The period selector
lists "últimos 30 dias", "nos últimos 3 meses" and then only the years that actually
contain orders, newest first (São Paulo calendar). One demo order lives in
config/demo-orders.json and is persisted by `seed:demo-orders` for an existing account
given by DEMO_ORDER_EMAIL, snapshotting catalog product p6 like checkout does; reruns
skip existing order numbers and the seed never creates users. A shared
features/orders module (single API reader + pure rules) now also feeds the /help
recent products and a Home "Seus pedidos" card shown only to signed-in users with orders.

Validation: lint, typecheck, 71 storefront unit tests (12 new), 35 API integration tests
on a disposable database, drift check on a disposable shadow database, OpenAPI
regenerated. Edge (Playwright) with a temporary session on the seeded account: 25
checks (DB/UI order parity, counter, year options, filters, search, tabs, details page,
/help and Home reuse, signed-out redirect, no overflow at 320–1920px); session removed.
Build compiled; standalone step hit the known Windows EPERM.

## 2026-09-29 — PRODUCT-002

Rebuilt /products/[productId] after the amazon.com.br page of the 8BitDo Ultimate 2C
(three reference screenshots) as ONE template for every catalog record: Prime notice,
breadcrumb, "Você comprou este produto…" banner, vertical-thumbnail gallery with a
full-image viewer, info column (brand, attributes, rating, badges, price, installments,
benefits, variants, "Sobre este item"), buy box (Prime box, delivery address, stock,
quantity, add to cart, buy now, shipped/sold by, returns), related rail, product details,
description, "Da marca" and customer reviews (summary, histogram, media, reviews).

Facts come from the catalog API; the new migration adds categories.parent_id so the
breadcrumb is the product's own category chain (API categoryPath; ?category= now lists a
whole subtree). Merchandising content the schema does not store lives in server-only
fixtures keyed by slug+SKU (demo-product-content, demo-categories, demo-brands,
demo-reviews); reviews go through a single ProductReviews source ready to be swapped for
an API. Variants are sibling catalog records (p6 Hortelã, p21 Pêssego, p22 Roxa, p23
Verde); p6 was upgraded from the old generic controller only while it still held the
untouched fixture values. Buy box uses the existing CartProvider and /checkout; guests go
to /login?next= (same-site paths only). Pix discount, delivery dates and customer media
are deliberately not shown (nothing in checkout/data backs them).

Validation: lint, typecheck, storefront/API/config unit tests, 38 API integration tests
on a disposable database, drift check, OpenAPI regenerated, Kustomize overlays. Edge
(Playwright): 27 end-to-end checks and a 661-check audit of all 27 products by slug and
UUID. Build compiled; standalone step hit the known Windows EPERM.

## 2026-09-29 — INTEGRATION-001

Audited Home → product → variant → cart → checkout → order → Seus pedidos → Atendimento →
product. One duplicated source found and removed: Home cards printed name/price from
config/demo-products.json. The fixture now only curates which products appear;
features/home/home-catalog.ts resolves each card to its catalog record (inactive/missing
records are omitted, glyph fallbacks kept). A browser journey with temporary DB prices
(restored) passed 30/30 checks: same UUID, name, price and image on every screen, order
snapshot reused by /orders, the Home orders card and /help, stock decremented once.

Pre-PR review fixes: the login `next` check now refuses whitespace/control characters
(browsers strip tab/newline, so "/	/evil.example" was an open redirect), and "Comprar
agora" adds the chosen units exactly like "Adicionar ao carrinho". Follow-ups (flags,
reviews backend, category/brand pages, HTTP 404, Pix, batch catalog read for the Home,
viewer focus trap, metadata on API failure, single breadcrumb query) are in backlog.yaml.

## 2026-09-29 — CATALOG-002 (+ CATALOG-BATCH-001)

Expanded the demo catalog from 27 to 150 products without touching the architecture: the
same config/demo-products.json + demo-product-content.json + demo-categories.json and the
same idempotent seed:demo. p24-p146 add 48 categories (up to four levels, new root Esportes;
gamer peripherals also linked to Games › PC › Acessórios › Periféricos Gamer through the
existing many-to-many), 30 brands and 24 colour families modelled exactly like the 8BitDo
(sibling records, variantOf, variant.group). Every new product has its own image: generated
SVG illustrations in the variant's colour, or a DummyJSON photo whose product name was
written to match the photo. Stock is mixed (146 available, 7 low, 4 sold out). The original
23 demo records are untouched (appended after them).

relatedProducts now ranks candidates (related-products.ts): category distance (all of the
product's categories first, then breadcrumb ancestors, one bounded request per level, only
while the rail is short), shared categories, availability, same brand, shared attributes
such as colour and similar price; the product's own family never appears and each other
family shows once (matching colour, else its head). Home rails draw from the whole catalog
(10 cards, one product type each) and resolve in one GET /catalog/products?slugs= call.

Validation: lint, typecheck, unit tests (storefront 149, API 12, config 13), 39 API
integration tests on a disposable database, seed run three times with identical counts,
OpenAPI regenerated. Browser (Playwright, FEATURES_FILE copy): Home, 15 products across
departments with click-through of a recommendation, variants, Home → product → related →
cart → checkout → order → Seus pedidos, other routes, 390px; all 147 product pages render
with a related rail (6-12 cards for every demo product). No console errors. Storefront
build compiled; standalone step hit the known Windows EPERM.

## 2026-09-29 — FLAGS-001

Turned on every implemented feature in the shared config/features.yaml: productDetails,
cart, checkout and browsingHistory. Before this, /products/[id] rendered Coming Soon for
anyone running with the default FEATURES_FILE; the page only worked with an ignored local
copy of the flags. Unbuilt destinations (catalog, account, productReviews, footer and
account-hub pages) stay off and keep rendering Coming Soon. features.spec now asserts the
four flags on and catalog/account off; config-schema specs use inline fixtures, unchanged.
No application code changed.

Validation: storefront unit tests 150, config-schema 13, typecheck, lint. Browser
(Playwright, default FEATURES_FILE): four products (UUID and slug, with and without
images), unknown id, gallery hover, quantity 3 → header count, related product
navigation, "Comprar agora" → /checkout, 390/768/1024/1280 px without horizontal
overflow, browsing history flyout with "No carrinho" badges. Build not run (dev server up).

## 2026-09-30 — FOOTER-001

Replaced the Coming Soon placeholders of the 12 institutional footer destinations (about,
corporate-information, careers, press, community, accessibility, amazon-science,
brand-protection, supply, publish, associates, advertise) with finished pages and turned
their flags on. One data-driven template in features/corporate: typed content (hero plus
split/cards/steps/compare/notice/faq/cta blocks) in know-us-content.ts and earn-content.ts,
rendered by corporate-body.tsx; own SVG icons; CSS isolated in corporate.css; the routes join
BARE_ROUTES in app/layout.tsx. Academic rule enforced by test: no statistics, dates, names,
openings, press releases or external URLs — honest `notice` blocks instead ("Nenhum
comunicado publicado…", "Não há vagas abertas…") and a disclaimer on every page.

Validation: lint, typecheck, storefront unit tests (corporate-pages.spec, 33 tests).
Browser (Playwright): 12 pages at 390/768/1024/1440 px without overflow or console errors,
FAQ by keyboard, footer and section-nav links. See docs/corporate-footer-pages.md.

## 2026-09-30 — FOOTER-002

Replaced the Coming Soon placeholders of payment-methods, points, credit-card, shipping,
returns, content-and-devices and recalls with help-article pages (teal customer-service bar,
breadcrumb, notice, numbered sections, FAQ, "Mais tópicos de ajuda" sidebar) and turned
their flags on. Built once in features/customer-pages from typed content blocks; server
components only; CSS in customer-pages.css. Copy mirrors the code: simulated card/Pix only,
R$ 0,00 shipping with no delivery date, the real order statuses, return window of one month
after delivery, installment example computed by installmentPlan; /payment-methods lists the
signed-in user's recent orders through orders-server. Points, credit card,
content/devices, online returns and recalls are marked unavailable/empty.

Integration fix: the seven routes were missing from the bare-layout list, so the skeleton
"BUILD STATE" strip and generic navigation rendered above the Amazon header; added
CUSTOMER_PAGE_ROUTES to app/layout.tsx.

Validation: lint, typecheck, storefront unit tests (customer-pages.spec, 19 tests). Browser:
7 pages at 390-1440 px, no overflow, footer and product-page links. See docs/help-pages.md.
