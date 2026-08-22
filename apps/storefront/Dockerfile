# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc tsconfig.base.json ./
COPY apps/storefront/package.json apps/storefront/
COPY packages/api-contract/package.json packages/api-contract/
COPY packages/config-schema/package.json packages/config-schema/
RUN pnpm install --frozen-lockfile --filter @amazon-mvp/storefront... --filter .

FROM deps AS build
COPY packages/ packages/
COPY config/ config/
COPY apps/storefront/ apps/storefront/
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @amazon-mvp/api-contract build \
 && pnpm --filter @amazon-mvp/config-schema build \
 && pnpm --filter @amazon-mvp/storefront build

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# `output: standalone` bundles only the server files actually reachable.
COPY --from=build /repo/apps/storefront/.next/standalone ./
COPY --from=build /repo/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=build /repo/apps/storefront/config ./apps/storefront/config
# Feature flags are mounted from a ConfigMap in-cluster; this copy is the fallback.
COPY --from=build /repo/config ./config

USER node
EXPOSE 3000
WORKDIR /app/apps/storefront
CMD ["node", "server.js"]
