# Agent handoff

## Current objective

SELL-001 — "Venda na Amazon" page on /sell (see current-state.md). PR preparation is
on feat/sell-page, created from origin/main at 41ecc5e (header PR #13 merged).
Commit, push and PR await the final explicit approval.

## Implementation

- /sell: hero, stats, story card, share stats, benefit cards, FAQ (<details>), CTA.
- Content and links in apps/storefront/src/features/sell/sell-content.tsx.
- AmazonHeader takes an optional currentHref (aria-current on the matching item).
- Previous objective CHECKOUT-001 merged in PR #12; its notes below still apply.

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
