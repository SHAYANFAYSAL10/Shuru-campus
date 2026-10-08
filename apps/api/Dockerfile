# syntax=docker/dockerfile:1
# API image. Build from the repo root (the API needs the contracts workspace):
#   docker build -f apps/api/Dockerfile -t campus-api .
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /repo
# Every workspace manifest, so `npm ci` matches the lockfile exactly.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/contracts/package.json packages/contracts/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/tsconfig/package.json packages/tsconfig/

# Full install, then build contracts and the API.
FROM base AS build
# Scripts are skipped (no husky without .git); argon2 ships prebuilt binaries.
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY packages/contracts packages/contracts
COPY packages/tsconfig packages/tsconfig
COPY apps/api apps/api
RUN npm run build -w @campus/contracts && npm run build -w @campus/api

# Production dependencies of the API and contracts only.
FROM base AS prod-deps
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
      --workspace @campus/api --workspace @campus/contracts \
  && mkdir -p apps/api/node_modules

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=4000
WORKDIR /app
COPY --from=prod-deps /repo/node_modules node_modules
COPY --from=prod-deps /repo/apps/api/node_modules apps/api/node_modules
COPY --from=build /repo/packages/contracts/package.json packages/contracts/
COPY --from=build /repo/packages/contracts/dist packages/contracts/dist
COPY --from=build /repo/apps/api/package.json apps/api/
COPY --from=build /repo/apps/api/dist apps/api/dist
WORKDIR /app/apps/api
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD ["node", "-e", "fetch(`http://127.0.0.1:${process.env.PORT}/api/v1/health`).then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "dist/main.js"]
