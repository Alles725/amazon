# Project context

Stable architectural context. Change this only when an architectural decision
changes (and add or supersede an ADR at the same time).

## What this is
A runnable skeleton for a simplified e-commerce MVP. It is not a clone of any
existing retailer, and carries none of their branding or UI.

## Architecture
| Concern | Choice |
| --- | --- |
| Shape | Modular monolith |
| Repository | pnpm TypeScript monorepo |
| Backend | Node.js + NestJS |
| Frontend | Next.js (App Router) + React |
| Database | PostgreSQL |
| ORM/migrations | Prisma |
| API | REST + OpenAPI |
| Auth | Opaque server-side sessions |
| Session storage | PostgreSQL |
| Orchestration | Kubernetes, packaged with Kustomize |
| Config | YAML + environment variable overrides |
| Feature flags | YAML |

## Non-negotiable rules
1. Modules never access another module's repositories or tables. Cross-module
   calls go through an application interface (`USERS_API`, `SESSIONS_API`,
   `CATALOG_API`, `CART_API`, `ORDERS_API`).
2. The storefront never imports from `apps/api`. It depends on
   `@amazon-mvp/api-contract` and the generated OpenAPI document.
3. Money is integer minor units. Never floating point.
4. `order_items` snapshots product data; it has no foreign key to `products`.
5. Every deployable component has YAML config, validated at startup. Invalid
   config fails fast.
6. No secret is ever committed. Local-only credentials live in the `local`
   overlay and nowhere else.
7. Feature work merges with `enabled: false` and is switched on through config.
8. Schema changes require a migration. Contract changes require a regenerated
   `docs/openapi.json` in the same commit.

## Out of scope
Payments, recommendations, search infrastructure, Kafka, Redis, microservices,
service mesh, marketplace, notifications, tax, fraud, logistics, multi-region,
advanced authorization.

## Ownership
- Developer 1 — `apps/api`, `database`
- Developer 2 — `apps/storefront`
- Developer 3 — `packages/`, `infrastructure/`, `docs/`, root tooling
