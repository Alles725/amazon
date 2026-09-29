# Agent handoff

## Current objective

PRODUCT-002 + INTEGRATION-001 — Amazon-style product detail page for every catalog product
and the end-to-end integration audit (see current-state.md, docs/product-details.md).
PR preparation is on feat/pagina-de-produto, created from origin/main at 9433c8c (orders
PR #17 merged). Commit, push and PR await the final explicit approval.

## Implementation

- apps/storefront/src/features/product: product-server.ts (catalog/addresses reads,
  related products), product-content.ts (server-only presentation fixtures),
  product-rules.ts (pure: variants, last purchase, dates, installments), reviews/
  (the only review source), gallery, overview, purchase (buy box), notices, sections.
- features/home/home-catalog.ts: Home cards resolved to catalog records.
- API: categories.parent_id (migration 20260930000000_category_hierarchy), categoryPath,
  category filter over the subtree. Seed: demo taxonomy, p21–p23, guarded p6 upgrade.
- New flag productReviews (false → Coming Soon on /products/[id]/review).
- Previous objective ORDERS-001 merged (PR #17).

## Configuration and limits

Shared cart/productDetails/checkout flags remain false (features.spec asserts it); local
runs point FEATURES_FILE at a copy with them on — FLAGS-001 decides the shared change.
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
