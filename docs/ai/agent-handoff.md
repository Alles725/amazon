# Agent handoff

## Current objective

ORDERS-001 — "Seus pedidos" on /orders (see current-state.md). PR preparation is on
feat/seus-pedidos, created from origin/main at 129bfe5 (favicon PR #16 merged).
Commit, push and PR await the final explicit approval.

## Implementation

- apps/storefront/src/features/orders: orders-server.ts (the only orders API reader),
  order-presentation.ts (pure rules: periods/years, search, counter, status, return
  window, distinct products), order-card.tsx, orders-view.tsx, recent-orders-card.tsx.
- Consumers: /orders, /orders/:id, /help recent products, Home "Seus pedidos" card.
- Demo order: config/demo-orders.json + `seed:demo-orders` (needs DEMO_ORDER_EMAIL of
  an existing account). Orders have nullable delivered_at/delivery_note.
- Previous objectives HELP-001 (PR #15) and TAB-001 (PR #16) merged.

## Configuration and limits

Shared cart/productDetails/checkout flags remain false. Ignored local override
enables all three. API :3001, storefront :3000, PostgreSQL Docker container mvp-pg.
Free shipping and no discounts are explicit academic rules; no real gateway,
card credentials, delivery prediction or payment/status automation (delivery fields
are only set by data, e.g. the demo seed). /checkout/success/:orderId is the real
confirmation; /orders lists the user's persisted orders.

## Validation

See current-state.md and development-log.md for completed checks and browser results.
Temporary tests use disposable products/accounts/databases, never production.
Do not remove the user-provided docs/reference/Checkout screenshot. Local env files
remain ignored. No Docker image builds, Kubernetes deploy or migration Job executed.
