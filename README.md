# Shuru Campus — Website & Admin

Marketing website and admin console for **Shuru Campus**, a co-working space in Gulshan, Dhaka.

- **Frontend:** Next.js (App Router, React Server Components, TypeScript)
- **Backend:** NestJS (REST, TypeScript)
- **Shared:** `@campus/contracts` (Zod schemas + inferred types used by both apps)
- **Phase 1:** no database. Content comes from typed seed data behind repository interfaces, so a DB can be added later without touching controllers or UI.

> **Status:** Documentation phase. Read the docs below before writing code.

## Documentation

| Doc | Purpose |
| --- | --- |
| [CLAUDE.md](CLAUDE.md) | Engineering rules for every contributor (human or AI). **Read first.** |
| [docs/01-product-brief.md](docs/01-product-brief.md) | Goals, audiences, scope, success criteria |
| [docs/02-content.md](docs/02-content.md) | All site copy, plans and prices, taken from shurucampus.com |
| [docs/03-architecture.md](docs/03-architecture.md) | Monorepo layout, data flow, the no-DB strategy, security |
| [docs/04-design-system.md](docs/04-design-system.md) | Visual direction, tokens, typography, motion, responsive rules |
| [docs/05-pages-and-interactions.md](docs/05-pages-and-interactions.md) | Page-by-page spec and signature interactions |
| [docs/06-api.md](docs/06-api.md) | REST API contract |
| [docs/07-admin.md](docs/07-admin.md) | Admin auth and configuration (read-only in Phase 1) |
| [docs/08-testing.md](docs/08-testing.md) | Test strategy, device matrix, quality gates |
| [docs/09-roadmap.md](docs/09-roadmap.md) | Phases, open questions |
| [docs/10-design-guidelines.md](docs/10-design-guidelines.md) | Color system (source of truth, contrast-verified) and composition rules |
| [docs/11-implementation-plan.md](docs/11-implementation-plan.md) | Step-by-step task list, M0–M9 |

## Quick start (once scaffolded)

```bash
# Requires Node >= 22 (developed on 24) and npm >= 10
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run dev          # web on :3000, api on :4000 (web proxies /api → api)
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Run web + api in watch mode |
| `npm run build` | Production build of all workspaces |
| `npm run lint` | ESLint + Prettier check |
| `npm run typecheck` | `tsc --noEmit` in every workspace |
| `npm test` | Unit and integration tests (Vitest in every workspace) |
| `npm run test:e2e` | Playwright across the device matrix |
| `npm run admin:hash -- <password>` | Generate the admin password hash for `.env` |
