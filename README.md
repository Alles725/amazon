# Amazon MVP Skeleton

A runnable skeleton for a simplified e-commerce MVP: modular monolith, pnpm
TypeScript monorepo, Kubernetes-first. It is not a clone of any existing
retailer and carries none of their branding or UI.

The one thing that works end to end is **authentication**. Everything else is a
boundary with a feature flag switched off.

> **Read `docs/ai/current-state.md` before trusting anything here.** It separates
> what has actually been executed from what has only been written. In particular,
> the initial migration SQL was hand-written and has never been applied — run
> `pnpm --filter @amazon-mvp/database drift:check` first.

## Requirements

| Tool | Version |
| --- | --- |
| Node.js | 20.11+ |
| pnpm | 9 |
| Docker | 24+ |
| kind | 0.23+ |
| kubectl | 1.29+ |
| kustomize | 5.4+ |

## Quick start (local Kubernetes)

```bash
pnpm install
pnpm --filter @amazon-mvp/database generate   # Prisma client, needed before any build
pnpm --filter @amazon-mvp/database drift:check # verify the hand-written migration

make bootstrap        # install + generate + build shared packages
make test             # unit tests, no database needed

make cluster          # kind cluster + ingress-nginx
make images           # build both images, load them into kind
make deploy           # apply the local overlay
make migrate          # run the migration Job
make seed             # categories and products
make smoke            # end-to-end check through the Ingress
```

The storefront is then at <http://localhost:8080> and the API at
<http://localhost:8080/api/v1>. Interactive docs: <http://localhost:8080/api/docs>
(enabled in local and development, off in production).

## Running outside Kubernetes

```bash
cp .env.example .env
docker run -d --name mvp-pg -p 5432:5432 \
  -e POSTGRES_USER=amazon_mvp -e POSTGRES_PASSWORD=local-dev-password \
  -e POSTGRES_DB=amazon_mvp postgres:16-alpine

pnpm --filter @amazon-mvp/database migrate:deploy
pnpm --filter @amazon-mvp/database seed

pnpm --filter @amazon-mvp/api dev          # :3001
pnpm --filter @amazon-mvp/storefront dev   # :3000, proxies /api to :3001
```

Outside the cluster the storefront uses a Next.js rewrite to reach the API. In
the cluster the Ingress does it and the rewrite is disabled
(`DISABLE_API_REWRITE=true`), so requests stay same-origin either way.

## Make targets

| Target | Does |
| --- | --- |
| `bootstrap` | Install, generate the Prisma client, build shared packages |
| `lint` / `typecheck` / `test` / `build` | Across every workspace package |
| `test-integration` | API integration suite (needs PostgreSQL) |
| `openapi` | Regenerate `docs/openapi.json` |
| `cluster` / `cluster-delete` | Manage the kind cluster |
| `images` | Build both images and load them into kind |
| `deploy` | Render and apply an overlay (`OVERLAY=local\|development\|production`) |
| `manifests` | Render an overlay without applying it |
| `migrate` / `seed` | Database Job and seed data |
| `status` / `logs` | Inspect the running deployment |
| `smoke` | End-to-end check through the Ingress |
| `clean` | Remove build output and dependencies |

## Layout

```
apps/api          NestJS modular monolith (auth, users, catalog, cart, orders)
apps/storefront   Next.js App Router storefront
packages/         api-contract (the frontend/backend boundary), config-schema
database/         Prisma schema, migrations, seeds
infrastructure/   Kubernetes base + local/development/production overlays, kind
config/           features.yaml — the single source of truth for feature flags
docs/             ADRs, architecture, and living AI documentation
```

## Endpoints

```
POST /api/v1/auth/register     POST /api/v1/auth/logout
POST /api/v1/auth/login        GET  /api/v1/auth/me
GET  /api/v1/protected/example
GET  /health                   GET  /ready
```

Errors always take one shape:

```json
{ "error": { "code": "AUTH_INVALID_CREDENTIALS", "message": "Invalid credentials", "requestId": "…" } }
```

## Feature flags

Edit `config/features.yaml`, then `make deploy`. Each route binds to a feature and
declares what happens when it is off:

- `coming-soon` — the route stays discoverable and renders a Coming Soon page
- `not-found` — the route returns 404 (used for checkout, which should not be
  half-visible)

Nothing outside `apps/storefront/src/config` is allowed to read this file; a test
enforces it.

## Working agreements

1. Modules never touch another module's tables. Cross-module calls go through an
   application interface (`USERS_API`, `SESSIONS_API`, `CATALOG_API`, …).
2. The storefront never imports from `apps/api`. It uses
   `@amazon-mvp/api-contract` and the OpenAPI document.
3. Money is integer minor units. Never floating point.
4. `order_items` snapshots product data so historical orders never change.
5. Schema changes need a migration; API contract changes need a regenerated
   `docs/openapi.json` in the same commit.
6. Features merge with `enabled: false` and are switched on through config.
7. No secrets in the repository. The only committed credentials are in the
   `local` overlay, for a cluster that runs on your laptop.

## Decisions

All provisional — see `docs/adr/`: modular monolith, TypeScript/Nest/Next,
PostgreSQL + Prisma, server-side sessions, YAML feature flags, Kustomize.
