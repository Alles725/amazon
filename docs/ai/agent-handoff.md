# Agent handoff

## Current objective

FOOTER-001 — see the development log entry of 2026-09-30 and current-state.md. PR preparation is on
feat/paginas-institucionais, part of a stacked chain of six branches to merge in order: institutional
footer pages, help/payment pages, Pix discount, reviews, account hub, listing and search.
Commit, push and PR await the final explicit approval.

## Implementation

- apps/storefront/src/features/product: product-server.ts (catalog/addresses reads,
  related products), product-content.ts (server-only presentation fixtures),
  product-rules.ts (pure: variants, last purchase, dates, installments), reviews/
  (the only review source), gallery, overview, purchase (buy box), notices, sections.
- features/home/home-catalog.ts: Home cards resolved to catalog records.
- API: categories.parent_id (migration 20260930000000_category_hierarchy), categoryPath,
  category filter over the subtree. Seed: demo taxonomy, p21–p23, guarded p6 upgrade.
- New flag productReviews (false → Coming Soon on /products/[id]/review).
- CATALOG-002: p24-p146 in the demo fixtures, images in public/images/products/catalog,
  related-products.ts (ranking), listBySlugs + API ?slugs= for the Home.
- Previous objective PRODUCT-002 merged (PR #18).

## Configuration and limits

Shared config enables productDetails, cart, checkout and browsingHistory (FLAGS-001,
features.spec asserts it); the default FEATURES_FILE needs no local copy.
API :3001, storefront :3000, PostgreSQL Docker container mvp-pg (port 5433). Start the
storefront from PowerShell (Git Bash rewrites API_PUBLIC_BASE_PATH=/api/v1 into a path).
Prime, reviews text and the brand story are demo presentation; no Pix discount, delivery
estimate or customer media. Unknown products render the not-found page with status 200 +
noindex (NOTFOUND-001). The user's demo order (p6, 2026-08-10) keeps its old snapshot name.

## Validation

See current-state.md and development-log.md for completed checks and browser results.
Temporary tests use disposable accounts/databases and restore any stock/price they touch.
Do not remove user-provided reference screenshots. Local env files remain ignored. No
Docker image builds, Kubernetes deploy or migration Job executed.
