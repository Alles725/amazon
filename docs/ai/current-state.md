# Current state

Last updated: 2026-08-14

This file describes only what is actually true right now. "Implemented" means the
code exists AND has been executed successfully. Anything written but never run is
listed as partial, with the reason.

## Verified working

Executed and passing in the authoring environment:

- `pnpm install` across the workspace.
- `packages/config-schema` — 13 unit tests pass (config precedence, env
  overrides, fail-fast validation, feature registry, route state resolution).
- `apps/api` unit tests — 11 pass, including real Argon2id hashing and
  verification, salting, session token generation and hashing, generic-error
  parity between wrong-password and unknown-email logins.
- `apps/storefront` — 11 tests pass (shipped `features.yaml` is valid, routes
  resolve to their documented behaviour, and no component reads feature config
  outside `src/config`).
- `apps/storefront` production build — succeeds, all 11 routes present.
- `packages/api-contract` and `packages/config-schema` builds.
- `kustomize build` for all three overlays — local renders 15 objects,
  development and production 13 each. Generated Secret names resolve correctly
  in every consumer reference.

## Partial — written but never executed

Blocked in the authoring environment, which has no Docker, kubectl, kind or
PostgreSQL, and where `binaries.prisma.sh` is unreachable
(`x-deny-reason: host_not_allowed`). None of the following is known to work:

| Item | Blocked by |
| --- | --- |
| `prisma generate` | Engine CDN unreachable |
| `database/prisma/migrations/…/migration.sql` | Hand-written, never applied. **Run `pnpm --filter @amazon-mvp/database drift:check` before trusting it.** |
| Seed script | Needs a database |
| API build and typecheck | Needs the generated Prisma client |
| API integration tests (13 cases) | Needs PostgreSQL |
| `docs/openapi.json` | Generator needs the API to boot |
| Both Dockerfiles | No Docker |
| kind cluster, deployment, migration Job | No cluster |
| `scripts/smoke-test.mjs` | No deployment |

## Not implemented

- Catalog, cart, checkout, order endpoints. Only module boundaries and
  application interfaces exist (`catalog.api.ts`, `cart.api.ts`, `orders.api.ts`).
- Storefront pages for those features render `EmptyState` behind a disabled flag.
- Account management beyond the authenticated shell.

## Known issues

1. **The migration SQL is unverified.** It was written by hand because
   `prisma migrate dev` could not run. Drift between it and `schema.prisma` is the
   single most likely cause of a first-run failure.
2. **`docs/openapi.json` does not exist yet.** CI checks it is current; that check
   will fail until it is generated once and committed.
3. **API unit tests run transpile-only** (`isolatedModules`), so type errors in the
   API surface in `pnpm typecheck`, not in `pnpm test`. Both run in CI.
4. `make seed` shells out to `kubectl run` and is the least tested target.

## Deployment state

Nothing has been deployed anywhere.

## Enabled features

From `config/features.yaml`: `home`, `authentication`. Everything else is off —
`checkout` renders 404, the rest render Coming Soon.
