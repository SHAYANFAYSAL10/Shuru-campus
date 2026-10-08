# 03 — Architecture

## Overview

```
                ┌──────────────────────────── Browser ────────────────────────────┐
                │  Public site (RSC + small client islands)   Admin console (/admin) │
                └───────────────┬───────────────────────────────────┬──────────────┘
                                │ HTML / RSC payload                 │ fetch /api/v1/*  (same origin)
                ┌───────────────▼───────────────────────────────────▼──────────────┐
                │ apps/web — Next.js (App Router)                                    │
                │  • Server Components fetch via typed API client                    │
                │  • proxy.ts guards /admin/* (cookie presence → else /admin/login)  │
                │  • rewrites /api/* → API_ORIGIN                                    │
                └───────────────────────────────┬───────────────────────────────────┘
                                                │ HTTP (server-to-server + proxied)
                ┌───────────────────────────────▼───────────────────────────────────┐
                │ apps/api — NestJS                                                   │
                │  Controllers → Services → Repository interfaces (DI tokens)         │
                │                                 └─ Phase 1: InMemory* (seed data)   │
                │                                 └─ Phase 2: Prisma* / Drizzle*      │
                └─────────────────────────────────────────────────────────────────────┘
                          ▲ both import ▲
                packages/contracts — Zod schemas, inferred types, constants
```

**Why the same-origin proxy:** The browser only ever talks to the web origin. That keeps the auth cookie first-party (`SameSite=Lax`, no third-party cookie issues), removes CORS from the browser path, and lets us deploy the API privately later.

## Monorepo layout

```
shuru-campus/
├─ apps/
│  ├─ web/
│  │  ├─ src/app/
│  │  │  ├─ (site)/            # public pages, shared marketing layout
│  │  │  │  ├─ page.tsx        # Home
│  │  │  │  ├─ spaces/         # Spaces & pricing (+ [slug])
│  │  │  │  ├─ about/  gallery/  contact/
│  │  │  │  └─ legal/[doc]/
│  │  │  ├─ admin/
│  │  │  │  ├─ login/
│  │  │  │  └─ (console)/      # authenticated layout: dashboard, settings, pricing, features
│  │  │  ├─ layout.tsx  not-found.tsx  error.tsx  sitemap.ts  robots.ts  opengraph-image.tsx
│  │  ├─ src/components/
│  │  │  ├─ ui/                # primitives: Button, Field, Dialog, Toast… (Radix-based, token-styled)
│  │  │  ├─ motion/            # Reveal, SplitText, BeginLine, Magnetic, Marquee, MotionProvider…
│  │  │  ├─ sections/          # page sections (Hero, PlanGrid, DayTimeline…)
│  │  │  └─ admin/
│  │  ├─ src/lib/              # api client, cn(), hooks (useReducedMotion…), contrast math, plan-finder logic
│  │  ├─ src/styles/           # globals.css (@theme tokens), motion.ts
│  │  ├─ content/legal/*.mdx
│  │  ├─ e2e/                  # Playwright specs
│  │  └─ proxy.ts
│  └─ api/
│     ├─ src/
│     │  ├─ main.ts  app.module.ts
│     │  ├─ common/            # zod pipe, exception filter, request-id, logger, origin guard
│     │  ├─ config/            # env schema (zod) + typed ConfigService
│     │  ├─ modules/
│     │  │  ├─ health/
│     │  │  ├─ site/           # site settings, amenities, gallery
│     │  │  ├─ plans/
│     │  │  ├─ inquiries/
│     │  │  ├─ auth/           # login/logout/me, JWT cookie, AdminGuard
│     │  │  └─ admin-config/
│     └─ test/                 # supertest e2e
├─ packages/
│  ├─ contracts/               # zod schemas + types, seed data, shared domain helpers (BDT, opening hours)
│  ├─ tsconfig/                # base tsconfig presets
│  └─ eslint-config/
├─ docs/
├─ turbo.json  package.json  .editorconfig  .prettierrc  .nvmrc
```

Tooling: **npm workspaces + Turborepo** (task caching and ordering), TypeScript project references, ESLint flat config and Prettier. Husky + lint-staged run on commit, and CI (GitHub Actions) runs lint, typecheck, test, build and e2e.

## Key technology choices

| Concern | Choice | Reason |
| --- | --- | --- |
| Web framework | Next.js (latest stable, App Router) | RSC, streaming, image and font optimization, metadata API |
| Styling | Tailwind CSS v4 + CSS variables | Tokens in CSS, zero runtime, container queries |
| Primitives | Radix UI (headless) | Accessible dialogs, menus and tabs with no imposed look |
| Animation | `motion` + Lenis (optional smooth scroll) | Layout/shared-element animations, springs, reduced-motion aware |
| Forms | React Hook Form + Zod resolver | Same schema as the API, client and server validation |
| Theming | `next-themes` (class strategy) | No flash of the wrong theme, follows the system |
| API framework | NestJS (latest stable) | Modules, DI, guards. Repository swap is trivial. |
| Validation | Zod via custom `ZodValidationPipe` | One schema for web and API |
| Auth | JWT in httpOnly cookie, `argon2` hash | Stateless, so no DB needed in Phase 1 |
| Rate limiting | `@nestjs/throttler` | Login and inquiry abuse protection |
| Logging | `nestjs-pino` | Structured JSON logs with request IDs |

## Phase 1: no database

Each module defines a repository **interface** and a DI token:

```ts
export interface PlansRepository {
  findAll(): Promise<Plan[]>;
  findBySlug(slug: string): Promise<Plan | null>;
}
export const PLANS_REPOSITORY = Symbol('PLANS_REPOSITORY');

// plans.module.ts — Phase 1
{ provide: PLANS_REPOSITORY, useClass: InMemoryPlansRepository }
```

- In-memory repositories load **seed data validated against the Zod schema at boot**, so bad seed data fails fast.
- Methods are `async` even in memory, so the DB swap doesn't change call sites.
- `InquiriesRepository.create()` in Phase 1 logs a redacted summary and returns a generated ID. Nothing is stored.
- `AdminConfigRepository.update()` in Phase 1 **throws `NotPersistedError`**. The service catches it and returns `202 { persisted: false }` (see `07-admin.md`).

**Phase 2 migration path:** add `PrismaPlansRepository` (or Drizzle), switch the provider via env (`DATA_SOURCE=memory|db`), and run the seed script into the DB from the same seed files. Controllers, services, contracts and UI stay the same.

## Brand configuration

The brand name (and logo, legal name, taglines) is **configuration, not code**.

- **Single source of truth:** `SiteSettings.brand` (schema `Brand` in `06-api.md`). Default values live in `packages/contracts/src/seed/brand.ts` and match `02-content.md`.
  - **Phase 1:** to rename, edit that one file (or set `BRAND_SEED`, below) and restart.
  - **Phase 2:** it's editable in the admin and stored in the DB.
- **Where it's used:**
  - Logo wordmark, `<title>` template (`%s · {name}`)
  - `metadata`, Open Graph image, `manifest.ts`, JSON-LD
  - Header, footer, copyright (`© {year} {legalName}`)
  - Section copy (`A day at {shortName}`), the admin console title, the 404 page
  - Legal pages: the MDX uses `<Brand field="legalName" />` instead of the literal company name
- **Access in web:**
  - Server Components call `getBrand()` from `src/lib/api`.
  - Client components read it from `<BrandProvider>` (filled once in the root layout) via `useBrand()`.
  - If the API is unreachable, `getBrand()` falls back to the seed default imported from contracts, so the name always renders.
- **Optional override without editing code:** `BRAND_SEED=<path to a JSON file>` on the API replaces the default brand at boot. It's validated by the `Brand` schema, and the API refuses to start if it's invalid. This is used by the rebrand test.
- **Internal identifiers are brand-neutral:** package scope `@campus/*`, cookie `admin_session`, CSS and token names (`--color-accent`, never `--shuru-*`). Renaming the brand never requires a code change.
- **Enforcement:**
  - `scripts/check-brand-literals.mjs` fails CI if the default brand words (`Shuru`, `শুরু`, case-insensitive) appear in `apps/*/src` or `apps/web/content`. Only `packages/contracts/src/seed/` is exempt.
  - The e2e **rebrand test** renders every page with a different brand and asserts the default name appears nowhere (`08-testing.md`).

## Data fetching and caching (web)

- Public content (site settings, plans, amenities, gallery) is fetched in Server Components and cached with tag-based revalidation (`site`, `plans`, …). Phase 2 admin saves call `revalidateTag`.
- If the API is unreachable at request time, pages render from the last cached response. The build doesn't require the API (`dynamic` rendering + cache).
- Admin pages are always dynamic and uncached (`no-store`). The session is checked server-side through `GET /auth/me`.

## Security model

- **Admin credentials (Phase 1):** a single admin from env: `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (argon2id). `npm run admin:hash` generates the hash. No plaintext passwords anywhere.
- **Session:** a signed JWT (`HS256`, `JWT_SECRET` ≥ 32 bytes, 8h expiry) in cookie `admin_session`: `HttpOnly; Secure (prod); SameSite=Lax; Path=/`.
- **Guarding:** `proxy.ts` in web does a fast redirect when the cookie is missing (UX only). **Authorization is enforced in the API** by `AdminGuard` verifying the JWT on every `/admin/*` route.
- **CSRF:** `SameSite=Lax` plus an `OriginGuard` rejecting mutations whose `Origin` isn't in `WEB_ORIGINS`.
- **Brute force:** login is throttled to 5 attempts/min/IP. Responses are uniform (`Invalid email or password`) with constant-time comparison.
- **Headers:** Helmet on the API. Next sets a CSP (nonce-based), `Referrer-Policy`, `Permissions-Policy` and `X-Content-Type-Options`.
- **Inquiries:** honeypot field plus throttling. All input is length-limited by the schema.

## Environment variables

| App | Variable | Example / notes |
| --- | --- | --- |
| api | `PORT` | `4000` |
| api | `NODE_ENV` | `development` \| `test` \| `production` |
| api | `WEB_ORIGINS` | `http://localhost:3000` (comma-separated) |
| api | `JWT_SECRET` | ≥ 32 random bytes |
| api | `JWT_TTL` | `8h` |
| api | `ADMIN_EMAIL` | `admin@shurucampus.com` |
| api | `ADMIN_PASSWORD_HASH` | argon2id hash |
| api | `DATA_SOURCE` | `memory` (Phase 1 only value) |
| api | `BRAND_SEED` | Optional path to a JSON file overriding the default brand (validated at boot) |
| web | `API_ORIGIN` | `http://localhost:4000` (server-side only) |
| web | `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` (canonical URLs, OG) |
