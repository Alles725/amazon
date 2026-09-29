# Agent handoff

## Current objective

HELP-001 — "Atendimento ao Cliente" page on /help (see current-state.md). PR
preparation is on feat/atendimento-ao-cliente, created from origin/main at a31f525
(sell PR #14 merged). Commit, push and PR await the final explicit approval.

## Implementation

- /help: customer-service bar, recent products from the user's real orders, action
  buttons, quick-links strip, help-library search, tabbed help topics.
- Copy in apps/storefront/src/features/help/help-content.ts; order mapping in
  recent-products.ts (server-only, reuses GET /api/v1/orders).
- Previous objective SELL-001 merged in PR #14; CHECKOUT-001 notes below still apply.

## Configuration and limits

Shared cart/productDetails/checkout flags remain false. Ignored local override
enables all three. API :3001, storefront :3000, PostgreSQL Docker container mvp-pg.
Free shipping and no discounts are explicit academic rules; no real gateway,
card credentials, delivery prediction or payment/status automation. Order list
page remains unimplemented; /checkout/success/:orderId is the real confirmation.

## Validation

See current-state.md and development-log.md for completed checks and browser results.
Temporary tests use disposable products/accounts/databases, never production.
Do not remove the user-provided docs/reference/Checkout screenshot. Local env files
remain ignored. No Docker image builds, Kubernetes deploy or migration Job executed.
