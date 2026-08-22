# Agent handoff

## Current objective
MVP-001 — authentication vertical slice. Code complete, never run end to end.

## Recently completed
Whole skeleton scaffolded. Unit tests green in three packages; storefront builds;
all Kustomize overlays render.

## Current problems
1. The initial migration SQL was hand-written and has never been applied.
   Run `pnpm --filter @amazon-mvp/database drift:check` first.
2. `docs/openapi.json` does not exist. CI's freshness check fails until it is
   generated once and committed.
3. Nothing has been built as an image or deployed to any cluster.

## Next recommended story
`FIRSTRUN-001` in `backlog.yaml` — generate the Prisma client, check drift, run
migrations, deploy to kind, run `make smoke`. Fix what breaks before writing new
features.

## Important files
- `config/features.yaml` — what is switched on
- `packages/config-schema/src/features.ts` — FeatureRegistry
- `apps/api/src/modules/auth/` — the vertical slice
- `apps/api/src/bootstrap.ts` — shared wiring for server, OpenAPI and tests
- `database/prisma/schema.prisma` — schema (source of truth for migrations)
- `infrastructure/kubernetes/` — manifests and overlays
- `docs/ai/current-state.md` — verified vs unverified, read before trusting anything

## Validation commands
```bash
pnpm --filter @amazon-mvp/database drift:check   # do this first
make bootstrap && make lint && make typecheck && make test
make manifests                                    # render without applying
make cluster && make images && make deploy && make migrate && make seed
make smoke
```

## Rules that are easy to break
- Never import `apps/api` from the storefront; use `@amazon-mvp/api-contract`.
- Never read another module's tables; go through the `*_API` interface.
- Money is integer minor units.
- Regenerate `docs/openapi.json` in the same commit as any API change.
- New features merge with `enabled: false`.
