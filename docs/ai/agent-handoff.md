# Agent handoff

## Current objective

CHECKOUT-001 — functional academic checkout based on docs/reference/Checkout.
PR preparation is on feat/academic-checkout, created from origin/main at 58da501
(product PR #11 merged). Commit, push and PR await the final explicit approval.

## Implementation

- Real authenticated cart, saved/selectable/editable addresses, simulated card/Pix.
- Two-column checkout with live quantity/removal/totals and persisted confirmation.
- Existing Order/OrderItem reused; migration 20260926000000_checkout adds addresses,
  address/payment/cost snapshots and unique sourceCartId, preserving existing data.
- Transactional cart/inventory/order handling with price revision and retry safety.
- Strict user ownership. Payment stores only SIMULATED_CARD / SIMULATED_PIX.
- Interfaces, shared contract, OpenAPI and docs/checkout.md reflect the new flow.

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
