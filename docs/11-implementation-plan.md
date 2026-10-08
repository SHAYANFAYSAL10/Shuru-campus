# 11 — Implementation Plan (Phase 1)

A step-by-step task list. Work through the milestones **in order**. Within a milestone, tasks can run in parallel unless `Depends on` says otherwise. Each task ends with green `lint`, `typecheck` and `test`, and a commit (Conventional Commits).

**How to use this file**
- Tick a task's checkbox when its acceptance criteria are met, and update the status in the summary table.
- Task IDs (e.g. `T2.3`) go in commit messages and PR titles: `feat(api): plans module [T2.4]`.
- If a task reveals a doc gap, fix the doc in the same PR.

**Size key:** S ≈ ½ day · M ≈ 1 day · L ≈ 2–3 days

> **Phase 1 has no database.** No DB server, ORM, migrations, SQLite or file-based storage.
> - All content comes from typed seed files in `packages/contracts/src/seed/`, served through in-memory repositories (`DATA_SOURCE=memory`).
> - Inquiries are validated and logged (redacted), not stored.
> - Admin saves validate and return `202 { persisted: false }`.
> - Admin credentials come from env variables, and sessions are stateless JWT cookies.
> - Restarting the API resets nothing because nothing is written.
>
> The database arrives in Phase 2 as new repository implementations (see `03-architecture.md`). **T0.7** enforces this rule in CI.

> **The brand name is configurable.** It is written once, in `packages/contracts/src/seed/brand.ts`. Everything else reads `brand.name` / `brand.shortName` / `brand.legalName`. **T0.8** enforces this in CI.

## Summary

| Milestone | Goal | Tasks | Size | Status |
| --- | --- | --- | --- | --- |
| M0 | Repo & tooling foundation | 8 | ~4d | ☑ |
| M1 | Shared contracts & seed data | 4 | ~2d | ☑ |
| M2 | NestJS API (public + auth + admin) | 10 | ~6d | ☐ |
| M3 | Design foundation in code | 8 | ~5d | ☑ |
| M4 | Layout shell | 5 | ~3d | ☑ |
| M5 | Public pages | 8 | ~8d | ☐ (3/8) |
| M6 | Signature interactions | 7 | ~6d | ☐ |
| M7 | Admin console | 7 | ~5d | ☐ |
| M8 | Quality hardening | 7 | ~4d | ☐ |
| M9 | Client review & release prep | 4 | ~3d | ☐ |

**Critical path:** M0 → M1 → (M2 ∥ M3) → M4 → M5 → M6 → M8 → M9. M7 needs M2 (auth) + M3, so it can run in parallel with M5 and M6.

---

## M0 — Repo & tooling foundation

- [x] **T0.1 Initialize repo** (S)
  `git init`, `.gitignore`, `.editorconfig`, `.nvmrc` (24), `.gitattributes` (LF), root `package.json` with npm workspaces (`apps/*`, `packages/*`), `engines`.
  *Done when:* `npm install` works on a clean clone.

- [x] **T0.2 Shared TS and lint config** (S). *Depends on:* T0.1
  TypeScript 6.0 + ESLint 9 (the newest versions typescript-eslint and jsx-a11y support). `packages/tsconfig` (base, `strict` + `noUncheckedIndexedAccess`, `nextjs`, `nestjs`, `library` presets), `packages/eslint-config` (flat config: typescript-eslint strict, import order, jsx-a11y, react-hooks), Prettier + `prettier-plugin-tailwindcss`.
  *Done when:* `npm run lint` and `npm run typecheck` run across workspaces (even if empty).

- [x] **T0.3 Turborepo pipeline** (S). *Depends on:* T0.2
  `turbo.json` tasks: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, with correct `dependsOn` and outputs.
  *Done when:* `npm run build` builds packages before apps, and a second run is a cache hit.

- [x] **T0.4 Scaffold apps** (M). *Depends on:* T0.2
  `apps/web`: create-next-app (TS, App Router, Tailwind v4, `src/`, alias `@/*`). `apps/api`: Nest CLI (strict, ESM: Nest 12 is ESM-only, tested with Vitest). Remove the boilerplate, wire up shared configs, set ports 3000/4000, add `.env.example` files.
  *Done when:* `npm run dev` serves both apps, and the web hello page fetches `GET /api/v1/health` through the rewrite.

- [x] **T0.5 Git hooks** (S). *Depends on:* T0.2
  Husky + lint-staged (eslint --fix, prettier on staged files), commitlint (conventional).
  *Done when:* a bad commit message is rejected.

- [x] **T0.6 CI skeleton** (S). *Depends on:* T0.3
  GitHub Actions: install (cached) → lint → typecheck → test → build. Node 24, `TZ=America/Los_Angeles`.
  *Done when:* the pipeline is green on the main branch.

- [x] **T0.7 No-DB guard** (S). *Depends on:* T0.6
  The `scripts/check-no-db.mjs` script fails if any workspace `package.json` depends on a database or ORM package (`prisma`, `@prisma/client`, `drizzle-orm`, `typeorm`, `@nestjs/typeorm`, `mongoose`, `@nestjs/mongoose`, `sequelize`, `pg`, `mysql2`, `sqlite3`, `better-sqlite3`, `@neondatabase/serverless`, `knex`, `kysely`). It also fails if `DATA_SOURCE` accepts anything other than `memory`. It runs in CI and in the pre-commit hook. It will be removed in Phase 2.
  *Done when:* adding `pg` to any workspace fails CI with a clear message pointing to this doc.

- [x] **T0.8 Brand-literal guard** (S). *Depends on:* T0.6
  `scripts/check-brand-literals.mjs` fails if `/shuru|শুরু/i` appears in `apps/*/src` or `apps/web/content` (only `packages/contracts/src/seed/` is exempt). It runs in CI and pre-commit.
  *Done when:* typing "Shuru" into a component fails the check with a hint to use `useBrand()`.

## M1 — Shared contracts & seed data

- [x] **T1.1 `@campus/contracts` package** (S). *Depends on:* M0
  Build with `tsdown` (ESM + CJS + d.ts) and Vitest. Export the barrel. (`tsup` was replaced: its d.ts step sets `baseUrl`, which TypeScript 6 rejects.)
  *Done when:* both apps import a dummy schema with full types.

- [x] **T1.2 Schemas** (M). *Depends on:* T1.1
  These are **Zod validation schemas** for API payloads, forms and seed data, not database schemas. Phase 1 has no DB.
  `SiteSettings`, `OpeningHours`, `Plan`, `Rate`, `Amenity`, `GalleryImage`, `InquiryCreate`, `LoginRequest`, `AuthUser`, `AdminConfig`, `PreviewSaveResult`, `ApiError`, plus enums (`PlanSlug`, `RateUnit`, `GalleryCategory`). Exactly per `06-api.md`.
  *Tests:* accept and reject cases for each schema (boundaries, e.g. message 9/10/2000/2001 chars, BD phone formats, honeypot).

- [x] **T1.3 Seed data** (M). *Depends on:* T1.2
  Typed seed files in `packages/contracts/src/seed/` (shared by api now and by the DB seed script later): **brand** (`brand.ts`, the only place the brand name is written), site, 6 plans, 11 amenities, gallery placeholders. Values copied **exactly** from `02-content.md`, with `TODO(client)` comments on the ⚠️ items.
  *Tests:* every seed passes its schema, plan slugs are unique, prices are positive integers, and hours are Sat–Thu 09:00–19:00 with Friday closed.

- [x] **T1.4 Shared domain helpers** (S). *Depends on:* T1.2
  `formatBdt(amount)`, `rateLabel(rate)`, `isOpenAt(hours, instant)`, `nextChange(hours, instant)`. They're pure, timezone-safe (`Intl` with `Asia/Dhaka`), and live in contracts so both apps share them.
  *Tests:* the Dhaka boundaries listed in `08-testing.md`, Friday, the midnight rollover and a non-Dhaka machine TZ.

## M2 — NestJS API

- [x] **T2.1 Config module** (S). Env schema (Zod) per `03-architecture.md`. Startup fails with readable errors.
  *Tests:* missing or short `JWT_SECRET` and missing `ADMIN_PASSWORD_HASH` both fail to boot.

- [x] **T2.2 Common layer** (M). `ZodValidationPipe`, global exception filter → `ApiError` shape, request-id middleware + `X-Request-Id`, `nestjs-pino` with redaction, Helmet, CORS, global prefix `/api/v1`, `Cache-Control` interceptor (public vs `no-store`).
  *Tests:* unit tests for the pipe and filter (validation → 400 shape, unknown → 500 with no stack in prod).

- [x] **T2.3 Health module** (S). `GET /health`.

- [x] **T2.4 Site module** (M). Repositories + services for site settings (including `brand`, with the optional `BRAND_SEED` JSON override validated at boot), amenities and gallery (`?category=`), with in-memory implementations seeded from contracts.
  *Tests:* supertest for each endpoint, including an invalid category → 400.

- [x] **T2.5 Plans module** (S). `GET /plans` (ordered), `GET /plans/:slug` (404 on unknown).

- [x] **T2.6 Throttling** (S). `@nestjs/throttler` global defaults, plus stricter named limits for login and inquiries (configurable for tests).
  *Tests:* the 6th login attempt in 60s → 429 + `Retry-After`.

- [x] **T2.7 Inquiries module** (S). `POST /inquiries` → 202. Honeypot no-op. Logs a redacted summary (no email or phone in logs).
  *Tests:* happy path, validation errors, honeypot, throttling, and a log redaction assertion.

- [x] **T2.8 Auth module** (M). `npm run admin:hash` script (argon2id), `POST /auth/login` (constant-time, uniform error), JWT cookie, `POST /auth/logout`, `GET /auth/me`, `AdminGuard`, `OriginGuard`.
  *Tests:* wrong email, wrong password, success sets the cookie flags, a tampered or expired JWT → 401, logout clears, a mutation with a foreign Origin → 403.

- [x] **T2.9 Admin-config module** (M). `GET /admin/config`, the `PUT` endpoints → `202 { persisted: false }` after full validation, and the repository's `update()` throws `NotPersistedError`.
  *Tests:* unauthenticated → 401, invalid body → 400 with field paths, valid → 202, and a follow-up GET is unchanged.

- [x] **T2.10 API docs & Docker** (S). Swagger at `/api/docs` (dev only) generated from the Zod schemas, plus a multi-stage `Dockerfile`.
  *Done when:* the coverage of `apps/api/src` is ≥ 80%.

## M3 — Design foundation in code

- [x] **T3.1 Tokens in CSS** (M). `globals.css`: palette + semantic tokens (light/dark/forced-colors/prefers-contrast) from `10-design-guidelines.md` A2–A3, the type scale, spacing, radius, shadow and z-index tokens from `04-design-system.md`, and Tailwind v4 `@theme` mapping.
  *Tests:* `contrast.test.ts` asserts every row of the A4 matrix by parsing the token values.

- [x] **T3.2 Fonts & base styles** (S). `next/font` for Fraunces (variable axes), Geist Sans and Geist Mono. Base typography, `text-wrap`, the selection color, the paper-grain overlay and the focus-visible ring.

- [x] **T3.3 Theming** (S). `next-themes` (System/Light/Dark), no flash, the `ThemeToggle` primitive, the 180ms root color transition.
  *Note:* `SegmentedControl` (from T3.6) shipped here, because the toggle is built on it.

- [x] **T3.4 Motion foundation** (M). `motion.ts` tokens, the `useReducedMotion` wrapper, `<Reveal>` (progressive, below-fold only, once), `<SplitText>`, `<BeginLine>` (SVG path draw), `<Magnetic>`, `<Marquee>` (pausable), and optional Lenis provider (off on touch and reduced motion).
  *Tests:* reduced-motion branches render final states, and Reveal content exists in the SSR HTML.

- [x] **T3.5 Primitives: actions** (M). `Button` (variants/sizes/loading keeps width), `IconButton`, `Link` (begin-line underline), `Badge`/`Chip`.

- [x] **T3.6 Primitives: forms** (M). `Field` wrapper (label, hint, error, `aria-describedby`), `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `SegmentedControl` (roving tabindex, spring thumb), plus React Hook Form + Zod integration helpers (`useZodForm`, focus the first error).
  *Tests:* RTL keyboard, error announcement and focus management.

- [x] **T3.7 Primitives: overlays & feedback** (M). `Dialog`, `Sheet` (Radix), `Toast` (live region, pause on hover/focus), `Tooltip`, `Skeleton`, `Price`, `OpenStatus`.
  *Tests:* focus trap and restore, Esc closes, toast announcement, and OpenStatus across mocked times.

- [x] **T3.8 Styleguide route** (S). `/_styleguide` (404 in production) renders every primitive in every state, in both themes.
  *Notes:* the folder is `src/app/%5Fstyleguide` (Next.js treats `_` folders as private). Set `ENABLE_STYLEGUIDE=true` at build time to include it in a production build for visual tests. Hover, focus and pressed states are frozen with `data-preview`.
  *Done when:* it's reviewed against the A6 component color table.

## M4 — Layout shell

- [x] **T4.1 Typed API client + brand access** (S). `getBrand()` (falls back to the seed default if the API is down), `<BrandProvider>` + `useBrand()` for client components, and `src/lib/api`: server-only fetchers, validated with contracts schemas, cache tags, a timeout, and an error-to-typed-result mapping.
  *Tests:* schema mismatch → typed error, and timeout handling.
  *Notes:* `apiFetch()` never throws; it returns `ApiResult<T>` whose failures are `http` (code/details/requestId/`retryAfterS`), `timeout`, `network` or `invalid-response`. Public GETs revalidate every 60s under the tags in `src/lib/api/tags.ts`. Server-side mutations send `Origin` from `NEXT_PUBLIC_SITE_URL`.

- [x] **T4.2 Header** (M). Logo, nav with begin-line `layoutId` underline, `OpenStatus`, theme toggle, Member login, primary CTA. Transparent → condensed on scroll, hide on down and show on up (not while focused), safe areas.
  *Notes:* the header lives in `src/app/(site)/layout.tsx`, so admin and the styleguide don't get it. `<SiteHeader>` is a Server Component; the scroll shell, nav and live widgets are client islands. Scroll rules are the pure `nextHeaderScroll()` reducer (`src/lib/header-scroll.ts`); the states are data attributes styled in `src/styles/header.css`, and only `translate` and `opacity` change: condensing slides the bar up by `--header-shift` (80 → 64px visible). Short screens (≤ 480px tall) stay at 64px. Reduced motion: condensing is instant and hiding is a crossfade. Without JS (`scripting: none`) the surface is always on. `<main>` clears the header with `--header-offset`, and a skip link comes first. Below `lg` only the logo and CTA show; nav, theme toggle and member login go into the T4.3 menu. Nav items come from `primaryNav()` (`src/lib/navigation.ts`, gallery behind its flag), with `aria-current` `page` or `true` for a section. `buttonClasses()` moved to `components/ui/button-classes.ts` so Server Components can style links as buttons.

- [x] **T4.3 Mobile navigation** (M). Full-screen `Sheet` below `lg`, staggered links, focus trap, Esc, scroll lock that preserves position, closes on route change.
  *Notes:* `<MobileNav>` (`components/layout/mobile-nav.tsx`) is the client island behind the header's menu button. The `full` `Sheet` has a sticky top bar at the header's current height (`--sheet-bar-height`, which follows `data-condensed`) and margins, and `headerStart` repeats the header's logo and CTA in it, so opening the menu only swaps the menu button for the close button (same position; focus starts there). Links stagger in by `staggerDelay()`; reduced motion is a 150ms crossfade. The bottom holds `OpenStatus`, a labelled `ThemeToggle` and Member login. Closing is derived state (the path it was opened on, reset during render): any plain link click closes it (even to the current page; modified clicks don't), as does a route change (back/forward included) and widening to `lg` (`MEDIA.wideNav`); none of them reopen it. Without JS the menu button does nothing; the footer nav (T4.4) is the no-JS route below `lg`.

- [x] **T4.4 Footer & announcement bar** (S). Footer content per `05-pages-and-interactions.md` and the "Let's begin." sign-off. The announcement bar is driven by `site.announcement` and can be dismissed (remembered per message).
  *Notes:* the `(site)` layout is now header, then a `min-h-dvh` column (clearing the header with `--header-offset`) of announcement bar, `<main>` and footer, so the footer sits at the bottom of short pages. `<SiteFooter>` (`components/layout/site-footer.tsx`, a Server Component on `bg-alt`): the "Let's *begin.*" sign-off with an in-view `BeginLine` and a "Book a visit" link; then Visit (address, Google Maps), Get in touch (`tel:` links via `telHref()`, `mailto:` + `CopyButton` with a toast), Hours (`OpenStatus` + `hoursSummary()`: Sat–Thu 9:00–19:00 · Fri closed, full day names for screen readers) and Explore (the `Footer` nav: Home, `primaryNav()`, Member login), as a container-query grid (1 → 2 → 4 columns); then `© {year} {legalName}`, the `Legal` nav (`LEGAL_NAV`) and outline social icons (`SocialIcon`; Lucide dropped brand marks). Outbound links open in the same tab, like Member login. `MAIN_CONTENT_ID` moved to `lib/navigation.ts`. `<AnnouncementBar>` is an info strip (`info-subtle`) **under** the header, in the page flow: it scrolls away with the page, never covers content and leaves the fixed header's scroll states and the menu's top bar untouched. Dismissal is remembered per message: `announcementId()` hashes text + link, the last 10 dismissed ids live in localStorage, and a blocking script in the root `<head>` (`ANNOUNCEMENT_BOOT_SCRIPT`, no announcement data) copies them onto `<html data-announcement-dismissed>` so an inline rule hides a dismissed bar before first paint. Closing fades the bar (opacity only, also under reduced motion) and moves focus to `<main>`. Without JS the close button is hidden but keeps its space. **T4.5:** the CSP must allow this inline script (hash or nonce), alongside next-themes'.

- [x] **T4.5 Global routes** (S). Root `not-found.tsx` (begin-line "not connected" animation), `error.tsx`, `loading.tsx` patterns, `sitemap.ts`, `robots.ts`, default metadata + `opengraph-image.tsx`, security headers + CSP.
  *Notes:* the `(site)` layout's shell moved into `<SiteShell>` (`components/layout/site-shell.tsx`), so the root `not-found.tsx` (unmatched URLs, outside `(site)`) wraps itself in it and `(site)/not-found.tsx` (`notFound()` in a page) doesn't; both render `<NotFoundSection>`: "This page hasn't *begun* yet.", a `<BrokenBeginLine>` that reaches for its end point and falls back short (CSS `draw-short`, no JS; reduced motion shows it at rest), and links to Home and Spaces. Errors: `(site)/error.tsx` keeps the shell, `app/error.tsx` stands alone (the shell failed) and `global-error.tsx` replaces the document (OS theme, no brand); all render `<ErrorSection>`: focus moves to the heading, `retry()` runs in a transition (the button shows it's working), the digest is shown as a reference and `reportError()` (`lib/report-error.ts`, the one sanctioned `console.error`) logs it; the error message is never shown. Loading: `(site)/loading.tsx` rendered a `<PageSkeleton>`; **removed in T5.1**, because a route-level boundary leaves no-JS visitors on the skeleton forever (see T5.1). Metadata: `siteMetadata(brand)` (`lib/metadata.ts`) gives the `%s · {name}` title template, description from the taglines, Open Graph/Twitter defaults and `formatDetection` off; `viewport` sets `theme-color` per OS scheme from `lib/palette.ts` (a test keeps it equal to tokens.css). A page that sets `openGraph` must spread the default in (it replaces the object). `opengraph-image.tsx` draws the brand name in Fraunces over the begin line, pillars above and tagline below (`assets/fonts`, OFL), with brand-based `alt`. `sitemap.ts` lists `publicPaths()` (`lib/seo-routes.ts`: nav order, plan pages after Spaces, gallery behind its flag, seed slugs if the API is down); `robots.ts` disallows `/admin`, `/api/` and `/_styleguide`. `SITE_URL` (`lib/site-url.ts`) is the one reader of `NEXT_PUBLIC_SITE_URL`. Security: see `03-architecture.md` → Security model. Until M5 the nav's prefetches of `/spaces`, `/about`, `/gallery` and `/contact` 404 (the pages don't exist yet).

## M5 — Public pages

Each page task includes: metadata (`pageMetadata()`), error states, content that renders without JS (no route-level `loading.tsx`; see T5.1), responsive verification at the B7 widths, a Playwright smoke test, and its routes added to the shared responsive suite (`e2e/routes.ts`: overflow, clipping, touch targets, hidden content, axe).

- [x] **T5.1 Home: hero + manifesto** (M). Static hero (the word cycle comes in T6.1), meta row, manifesto section.
  *Notes:* `(site)/page.tsx` fetches site settings and plans and renders `<HomeHero>` and `<Manifesto>` (`components/home/`, Server Components). **Hero:** "Your startup *begins* here." (`<HeroHeadline>`): words mask up on first paint and the begin line draws under the italic *begins* (B2), all from CSS, so it plays without JS and rests under reduced motion; screen readers get the sentence once. T6.1 cycles "startup". Then the sub, *Find your space* (→ `/spaces`) and *Book a visit*, full-width buttons on phones, and an "At a glance" list: `OpenStatus`, "From ৳100/hr" (`cheapestRate(plans, 'hour')`, `lib/plans.ts`; left out if plans fail to load, never guessed) and the open days from `hoursSummary()` (24h times, matching the footer). `<HeroImage>` art-directs with `getImageProps` + `<picture>` (4:5 → 16:9 at `md`), loads eagerly at high priority, is never hidden, settles 1.05 → 1 (`animate-settle`) and gets the A5 warm tone (`photo-tone`). The placeholders come from `scripts/placeholders.mjs` (`lib/hero-media.ts`, TODO(client)). **Manifesto** (`bg-alt`): the pillars as an eyebrow `h2` (`aria-label` reads them as a list), then one `type-h2` statement per pillar that opens with the pillar ("*Empower* your business…", `lib/manifesto.ts`, from the About copy). Pillars without a statement are skipped, and the section disappears if none match (a renamed brand). Statements `<Reveal>` progressively; T6.7 makes them scroll-linked. **Metadata:** `pageMetadata(brand, { title?, description, path })` (`lib/metadata.ts`) is the M5 pattern: canonical URL and OG/Twitter that keep the site defaults. **No-JS:** route-level `loading.tsx` was removed (T4.5's `(site)/loading.tsx` and `<PageSkeleton>`): streamed boundaries need JS to reveal, so no-JS Home showed "Loading page" forever. Public pages now arrive whole (CLAUDE.md §3). Follow-up idea: a begin-line progress bar for client navigations. **E2E starter** (ahead of T8.1): `apps/web/playwright.config.ts` (Chromium: mobile-xs, mobile-android, mobile-landscape, tablet, laptop, wide, zoom-200; `webServer` builds and starts the API with the test env and a production web build; `E2E_WEB_PORT`/`E2E_API_PORT` let it run beside dev servers), `e2e/responsive.spec.ts` (light, and dark + reduced motion: overflow, escaping and clipped elements, 44px targets on touch, content left at opacity 0, landscape header height, axe WCAG 2.2 AA) over `e2e/routes.ts`, and `e2e/home.spec.ts`. The suite caught two footer targets under 44px ("Book a visit", "Home"), fixed here.
- [x] **T5.2 Home: spaces + amenities + why co-working** (M). Plan cards (mobile snap carousel with buttons), the amenity bento, the editorial explainer columns.
  *Notes:* Home now fetches amenities too. Numbered eyebrows (B2) come from `<SectionHeading>` (`components/sections/section-heading.tsx`); the page numbers its sections from Spaces (`01 — Spaces`) and closes the numbering up when a section is left out. **Spaces** (`<SpacesSection>`): plans in `order` (`sortPlans()`) as `<PlanCard>`s showing the 4:5 photo (`lib/plan-media.ts`, placeholders from `scripts/placeholders.mjs`, TODO(client)), the name, the audience, "From" + `planFromRate()` (the plan's lowest rate) and `keyFeatures()` (the first 3), with a "Popular" badge on `highlight`. The whole card is one link (a stretched link on the name) to `planHref()` = `/spaces/[slug]` (404 until T5.5; T6.5 adds the transition), and it lifts and eases its photo on fine-pointer hover. The cards lay out on a CSS subgrid (5 rows), so names, prices and features line up across a row even when an audience wraps. Card rows are spaced by the cards' bottom margin, not a row gap, because Chromium adds the parent's row gap into the subgrid's rows. Below `md` the list is a `<SnapCarousel>` (`components/ui/snap-carousel.tsx`): native scroll-snap that bleeds to the screen edges (`bleed-page-x`), with the next card peeking in. Previous/next buttons appear once hydrated, move one card, disable at the ends (handing focus to the other button) and jump under reduced motion. Without JS it still scrolls and snaps. "Compare all plans" → `/spaces`. If the plans fail to load, the section shows an inline notice with "Get in touch" (there's an empty-state variant too). **Amenities** (`<AmenitiesSection>`, `bg-alt`): from `md`, a bento whose spans come from `bentoSpans()` (`lib/bento.ts`). That function picks the 2×2 feature plus the fewest wide tiles that close the grid with no holes under `grid-auto-flow: dense` (checked by simulating placement; it drops the feature, or falls back to single cells, when no layout fits), worked out separately for 3 columns (`md`) and 4 (`lg`). The feature tile sits on the lake band. Below `md` it's a `<Marquee>` of surface chips. Icons come from `amenityIcon()`/`<AmenityGlyph>` (`lib/amenity-icons.ts`, an explicit Lucide map with a fallback). The section is left out if amenities fail to load. **Why co-working** (`<WhyCoworking>`): `EXPLAINERS` (`lib/explainers.ts`, also used by About in T5.7) as two editorial columns, each with a `type-pullquote` blockquote that reveals progressively, a `cite` and a linked source (new tab), and a line on what the idea means here.
- [x] **T5.3 Home: visit us + CTA band** (S). Hours table with today highlighted, static map with an external link, click-to-call and copy-email with a toast, JSON-LD `LocalBusiness`.
  *Notes:* **Visit us** (`<VisitSection>`, `bg-alt`, numbered after Why co-working): a 7/5 split of `<MapCard>` and the details. The map is a token-colored SVG illustration (it themes with the page and makes no third-party request or embed) with the pin at its center; the whole card links to `contact.mapUrl` (same tab, like the footer). TODO(client): swap it for a static map export of the real location. The details sit in a container query: stacked when narrow, address and "Call or email" side by side from `@md` (contact sized to the email so it never breaks mid-word), then both stacked beside the hours from `@2xl` (tablets). Phones are `tel:` links (`telHref()`), and the email is `mailto:` + `CopyButton` (toast). **Hours:** `OpenStatus` and `<HoursTable>` (client): one row per day from Saturday (`hoursByDay()`, `lib/hours-summary.ts`) in a captioned `<table>`. Today (Dhaka time, `useNowMinute`) gets `accent-subtle`, a "Today" label and `aria-current="date"`, only after hydration, so a cached page never marks yesterday. Without JS the table is complete, just unmarked. **CTA band** (`<CtaBand>`, `bg`, not numbered): a centered "Ready when *you* are." (not "Ready to begin?": the footer's "Let's begin." sits right below, and B5 allows the brand thread once per screen), a lead, one magnetic primary "Send an inquiry" → `/contact` and "Or call {first phone}". With `features.inquiryForm` off, the button becomes "Call {phone}". **JSON-LD:** `localBusinessJsonLd(site)` (`lib/local-business.ts`) builds `LocalBusiness` from site settings only: brand names, description, the first phone, email, address lines as `streetAddress` + `BD`, `hasMap`, opening hours grouped by identical times and socials as `sameAs`. `<JsonLd>` (`components/seo/json-ld.tsx`) renders it with `<` escaped (`jsonLdHtml()`). Contact (T5.6) reuses both.
- [ ] **T5.4 Spaces & pricing** (L). Plan sections, the period filter (`?period=` synced), the comparison table → stacked cards below `md`, the FAQ accordion, "Book this" deep links.
- [ ] **T5.5 Plan detail `/spaces/[slug]`** (S). `generateStaticParams`, 404 for unknown slugs, related plans.
- [ ] **T5.6 Contact** (L). The inquiry form (pre-filled from the query), all states (idle, submitting, success morph, error), a server action fallback without JS, a side info panel, JSON-LD.
- [ ] **T5.7 About** (M). Story, the meaning of the name (if `brand.nameMeaning` is set), pillars, explainers, audience tiles.
- [ ] **T5.8 Gallery + Legal** (M). Masonry grid with filter chips and a `layout` reflow (the lightbox comes in T6.6). Legal MDX pages from `docs/reference/legal-source.md`, with a sticky ToC + scroll-spy and a print stylesheet.

## M6 — Signature interactions

Each one: reduced-motion variant, 60fps check on a throttled CPU (4×), keyboard access, and tests.

- [ ] **T6.1 Hero word cycle + begin line draw** (M). Mask-slide cycle with a visible pause button (WCAG 2.2.2), hover and focus pause, and the begin line handing off to the nav underline.
- [ ] **T6.2 Plan finder** (M). Pure `recommendPlan(answers)` in `src/lib` (unit-tested for every answer combination), a 3-step segmented UI, an animated result card, and a CTA carrying the plan. Lazy-loaded.
- [ ] **T6.3 Price odometer** (S). Digit-roll on period change, tabular figures (no width shift), with an `aria-live` summary for screen readers.
- [ ] **T6.4 A day at {shortName} timeline** (M). A horizontal rail with snap, a current-Dhaka-time marker (updates each minute), scroll-linked highlights, and the lake band styling.
- [ ] **T6.5 Plan card → detail transition** (M). The View Transitions API with a `motion` layout fallback.
- [ ] **T6.6 Gallery lightbox** (M). A shared-layout zoom, swipe, arrows, a counter, captions, focus trap and restore, preloading of the neighbors. Lazy-loaded.
- [ ] **T6.7 Micro-interactions pass** (S). Magnetic CTA, card hover lifts, amenity icon nudge, link underline draws, manifesto scroll-linked text. Verify that hover effects are gated behind `(hover: hover)`.

## M7 — Admin console

- [ ] **T7.1 Route protection** (S). `proxy.ts` cookie check → redirect with `next`, the `safeNextPath()` helper (unit-tested against open-redirect payloads), `noindex` on all `/admin`.
- [ ] **T7.2 Login page** (M). Form with all error states (credentials, 429 countdown, network), show/hide password, redirect to `next`.
- [ ] **T7.3 Console layout** (M). Server-side `/auth/me` check, sidebar (desktop) or top bar + sheet (mobile), user menu with logout, the persistent Preview mode banner.
- [ ] **T7.4 Dashboard** (S). Greeting, config area cards, a system health card (API status, data source, version).
- [ ] **T7.5 General settings** (M). All fields from `07-admin.md`, the weekday hours editor, dirty tracking, Save/Discard, the `202 persisted:false` flow (info toast + reset + highlight reverted fields), and an unsaved-changes guard.
- [ ] **T7.6 Pricing** (M). Plans table + edit drawer (rates and features editor, reorder by keyboard and drag), the same save flow.
- [ ] **T7.7 Features** (S). Toggles + announcement editor with a live preview of the banner, the same save flow.

## M8 — Quality hardening

- [ ] **T8.1 Playwright device matrix** (M). Extend the T5.1 starter config to all 11 projects from `08-testing.md` (WebKit, Firefox, iPhone, iPad, 1440, 2560), `webServer` booting api + web with test env, sharding in CI.
- [ ] **T8.2 Responsive invariants suite** (M). The 7 invariants × every route × every project, plus dark + reduced-motion variants.
- [ ] **T8.3 Journeys** (M). All 12 journeys from `08-testing.md`, including the rebrand test, no-JS and the admin flows.
- [ ] **T8.4 Accessibility** (S). axe on every route and theme, a manual screen-reader pass (NVDA + VoiceOver), keyboard-only walkthrough notes.
- [ ] **T8.5 Visual regression** (S). Baselines for the styleguide + key sections (3 viewports × 2 themes).
- [ ] **T8.6 Performance** (M). Lighthouse CI budgets, bundle analysis (≤ 180 KB first-load per route), image `sizes` audit, font subsetting, and fixes until green.
- [ ] **T8.7 Coverage & cleanup** (S). Coverage floors met, no `TODO` without an owner (except `TODO(client)`), no console warnings, docs synced with the code.

## M9 — Client review & release prep

- [ ] **T9.1 Preview deployment** (S). Web on Vercel (or Docker), API on Render/Fly/Railway (or Docker), env configured, a seeded admin account for the client.
- [ ] **T9.2 Design review package** (S). A walkthrough checklist for the client: the styleguide, every page at 4 widths, both themes, a reduced-motion demo, the admin preview flow, and the list of open ⚠️ content questions.
- [ ] **T9.3 Feedback iteration** (L). Triage the feedback into issues, fix, and re-run the M8 suites.
- [ ] **T9.4 Launch checklist** (S). Real content and photos in place, legal reviewed, analytics decision, error monitoring (Sentry), uptime check on `/health`, DNS + HTTPS, a final Lighthouse run.

---

## Risks & mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| No client photos by M5 | Layouts judged on placeholders | Use placeholders at final ratios and swap them in through seed data alone |
| Animation jank on low-end Android | Poor impression | Transform and opacity only, a CPU-throttle check per T6 task, motion budget reviews |
| Ambiguous pricing (⚠️ items) | Wrong info shown publicly | `TODO(client)` markers + a blocker on T9.4 |
| Scope creep into Phase 2 (saving, bookings) | Delays | Rules in `CLAUDE.md` §7, Phase 2 items logged to the backlog |
| Cookie and proxy issues across deploy targets | Admin login breaks in prod | Same-origin rewrite tested in the preview deploy (T9.1) before the review |
