# syntax=docker/dockerfile:1

# --- deps ------------------------------------------------------------------
FROM node:20-bookworm-slim AS deps
RUN corepack enable && apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/api-contract/package.json packages/api-contract/
COPY packages/config-schema/package.json packages/config-schema/
COPY database/package.json database/
RUN pnpm install --frozen-lockfile

# --- build -----------------------------------------------------------------
FROM deps AS build
COPY packages/ packages/
COPY database/ database/
COPY apps/api/ apps/api/
# The Prisma client must be generated before the API is type-checked/compiled.
RUN pnpm --filter @amazon-mvp/database generate \
 && pnpm --filter @amazon-mvp/api-contract build \
 && pnpm --filter @amazon-mvp/config-schema build \
 && pnpm --filter @amazon-mvp/database build \
 && pnpm --filter @amazon-mvp/api build \
 && pnpm prune --prod

# --- runtime ---------------------------------------------------------------
FROM node:20-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /repo

COPY --from=build /repo/node_modules node_modules
COPY --from=build /repo/packages packages
COPY --from=build /repo/database database
COPY --from=build /repo/apps/api/node_modules apps/api/node_modules
COPY --from=build /repo/apps/api/dist apps/api/dist
COPY --from=build /repo/apps/api/config apps/api/config
COPY --from=build /repo/apps/api/package.json apps/api/package.json

# node:20 ships an unprivileged `node` user (uid 1000); the manifests pin the
# same uid in securityContext.
USER node
WORKDIR /repo/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
