# syntax=docker/dockerfile:1
# Web image. Build from the repo root; compose.yaml does this for you:
#   docker compose build web
# Plain docker needs the same `api` → 127.0.0.1 mapping compose sets (see the build stage):
#   docker build -f apps/web/Dockerfile --add-host api=127.0.0.1 -t campus-web .
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /repo
# Every workspace manifest, so `npm ci` matches the lockfile exactly.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/contracts/package.json packages/contracts/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/tsconfig/package.json packages/tsconfig/
# Scripts are skipped (no husky without .git); argon2 ships prebuilt binaries.
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY packages/contracts packages/contracts
COPY packages/tsconfig packages/tsconfig
COPY apps/api apps/api
COPY apps/web apps/web

# Both are baked into the build: the /api rewrite target and the canonical site URL.
ARG API_ORIGIN=http://api:4000
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV API_ORIGIN=${API_ORIGIN} NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    BUILD_STANDALONE=true NEXT_TELEMETRY_DISABLED=1

RUN npm run build -w @campus/contracts && npm run build -w @campus/api

# Pages such as /spaces/[slug] prerender from the API, so a throwaway API (seed data, build-only
# credentials that never leave this step) serves the build at API_ORIGIN. The build host maps
# API_ORIGIN's hostname to 127.0.0.1 (compose.yaml → build.extra_hosts). Its port is read from
# API_ORIGIN, so it's 4000 here.
RUN <<'EOF'
set -e
cd apps/api
PORT="$(node -p 'new URL(process.env.API_ORIGIN).port || 80')" \
NODE_ENV=test \
WEB_ORIGINS="$(node -p 'new URL(process.env.NEXT_PUBLIC_SITE_URL).origin')" \
JWT_SECRET=build-only-secret-never-used-at-runtime \
ADMIN_EMAIL=build@example.com \
ADMIN_PASSWORD_HASH='$argon2id$v=19$m=65536,p=4,t=3$UgB9nfXkhY3hQymNSo/RNg$FASV5IJ9USa+VtgjnFwXM95CUl9K1uSHuyeM4BvAsm4' \
LOG_LEVEL=warn \
  node dist/main.js &
cd /repo
node -e '
  const url = `${process.env.API_ORIGIN}/api/v1/health`;
  const deadline = Date.now() + 30_000;
  (async () => {
    while (Date.now() < deadline) {
      try { if ((await fetch(url)).ok) return; } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    console.error(`Build-time API never answered at ${url}. Is its hostname mapped to 127.0.0.1 (build.extra_hosts / --add-host)?`);
    process.exit(1);
  })();
'
npm run build -w @campus/web
EOF

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# The standalone server mirrors the monorepo layout; static assets and public/ go beside it.
# Owned by `node` so the data cache (.next/cache) can be written.
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD ["node", "-e", "fetch(`http://127.0.0.1:${process.env.PORT}/robots.txt`).then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "apps/web/server.js"]
