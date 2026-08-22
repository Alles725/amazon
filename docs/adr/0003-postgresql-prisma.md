# 0003 — PostgreSQL with Prisma

Status: provisional (2026-01)

## Context
Users, carts, inventory and orders are relational and need transactions.
Schema changes will be frequent during the MVP.

## Decision
PostgreSQL with Prisma for schema, migrations and client access. One generated
client, owned by `database/`, consumed by the API.

## Benefits
- Strong relational and transactional guarantees.
- Migrations are fast to write and are versioned in the repository.
- Generated types flow into the API without hand-written mappings.

## Trade-offs
- An ORM abstraction sits between the code and the SQL that actually runs.
- `prisma generate` must run before typecheck or build, which makes the client a
  build-time prerequisite in CI and in the Dockerfile.

## Money
Money is stored as integer minor units (`price_minor`, `total_minor`), never
floating point. `order_items` snapshots product name, SKU and unit price so
historical orders do not change when the catalog does.

## Revisit when
Query patterns outgrow the ORM, or read scaling requires a separate path.
