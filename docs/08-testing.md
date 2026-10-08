# 08 — Testing Strategy

## Layers

| Layer | Tool | Location | What it covers |
| --- | --- | --- | --- |
| Contracts | Vitest | `packages/contracts/src/**/*.test.ts` | Schema accept/reject cases, seed data validity, `formatBdt`, `isOpenAt` / `nextChange` (Asia/Dhaka, Friday, boundaries at 08:59/09:00/18:59/19:00) |
| Web logic | Vitest | `apps/web/src/lib/**/*.test.ts` | `recommendPlan`, `safeNextPath`, API client error mapping, token contrast |
| Web components | Vitest + React Testing Library + `user-event` | `apps/web/src/**/*.test.tsx` | Forms (validation, focus to first error, pending/success/error), SegmentedControl keyboard, Dialog focus trap/restore, word-cycle pause control, reduced-motion branches |
| API unit | Vitest (Nest 12 ESM default) | `apps/api/src/**/*.spec.ts` | Services, guards (AdminGuard, OriginGuard), ZodValidationPipe, exception filter, in-memory repositories |
| API integration | Vitest + supertest | `apps/api/test/*.e2e-spec.ts` | Every endpoint: happy path, validation errors, auth (no cookie / bad / expired JWT), throttling (429 + Retry-After), Origin check, honeypot, `persisted:false` + unchanged follow-up GET |
| End-to-end | Playwright | `apps/web/e2e/*.spec.ts` | Real web + api servers (`webServer` config), user journeys below |
| Accessibility | `@axe-core/playwright` | inside e2e | 0 violations (WCAG 2.2 A/AA tags) on every route, both themes |
| Responsive | Playwright | `e2e/responsive.spec.ts` | Overflow and layout invariants on every route × every viewport |
| Visual | Playwright `toHaveScreenshot` | `e2e/visual.spec.ts` | Key sections + `/_styleguide`, animations disabled, fonts loaded, 3 viewports × 2 themes |
| Performance | Lighthouse CI | CI job | Budgets from `CLAUDE.md` §3 on public routes (mobile profile) |

Time in tests: use fake timers (`vi.setSystemTime`) with explicit **Dhaka** instants (e.g. `2026-10-09T09:00:00+06:00` is a Friday, so it should be closed). Never depend on the machine's timezone. CI runs with `TZ=America/Los_Angeles` on purpose to catch timezone leaks.

## Device matrix (Playwright projects)

| Project | Viewport | Notes |
| --- | --- | --- |
| `mobile-xs` | 320×568 | Smallest supported. WCAG reflow width. |
| `mobile` | iPhone 15 (393×852, WebKit, touch) | |
| `mobile-android` | Pixel 7 (412×915, Chromium, touch) | |
| `mobile-landscape` | 844×390 | Short viewport: header/hero must not eat the screen |
| `tablet` | iPad Mini (768×1024, WebKit, touch) | |
| `laptop` | 1280×800 | |
| `desktop` | 1440×900 | Primary design width |
| `wide` | 1920×1080 | |
| `ultrawide` | 2560×1440 | Content capped, no stretched lines |
| `zoom-200` | 1280×800 at CSS 640×400 | Simulates 200% zoom (`deviceScaleFactor: 2`, viewport halved) |
| `firefox-desktop` | 1440×900, Firefox | Cross-engine |

Journeys run on `mobile`, `tablet`, `desktop` and `firefox-desktop`. Responsive, a11y and overflow checks run on **all** projects.

## Responsive invariants (`responsive.spec.ts`)

For every public route and admin route (logged in), on every project:

0. Run with the default brand **and** the long-name brand fixture.
1. **No horizontal overflow:** `document.documentElement.scrollWidth <= window.innerWidth`.
2. **No element escapes the viewport:** every visible element's `getBoundingClientRect()` has `right <= innerWidth + 1` (except within `[data-allow-overflow]` scrollers, which must be keyboard-scrollable and labeled).
3. **No clipped text:** for `h1–h3`, buttons and links, `scrollWidth <= clientWidth + 1`.
4. **Touch targets** ≥ 44×44 on touch projects for interactive elements (excluding inline text links).
5. **Header** height ≤ 20% of the viewport on `mobile-landscape`.
6. **No visible content with `opacity: 0`** after scrolling the page to the bottom and back (reveal animations completed).
7. The same checks with `reducedMotion: 'reduce'` and `colorScheme: 'dark'`.

## Core journeys (e2e)

1. **Explore → inquire:** Home → Spaces card → plan detail → "Book this" → contact form pre-filled → submit → success card.
2. **Plan finder:** answer the 3 questions → correct recommendation → CTA carries the plan.
3. **Pricing period filter:** switching periods updates the highlighted rates and the URL (`?period=monthly`) is shareable.
4. **Contact validation:** empty submit → errors announced, focus on the first invalid field. Fix → submit. API failure (route mocked 500) → error banner, inputs preserved.
5. **Navigation:** mobile menu open/close (Esc, overlay click, link click), focus trap, scroll lock, theme toggle persists across reload.
6. **Gallery:** open the lightbox via keyboard, arrow navigation, Esc closes, focus returns to the thumbnail.
7. **Open status:** with the clock mocked (`page.clock`) to a Dhaka Saturday 10:00 it shows "Open now", Friday shows "Closed today", and Thursday 18:30 shows "Closes in 30 min".
8. **Admin auth:** `/admin` redirects to login. Wrong password gives the uniform error. Correct → dashboard. Reload keeps the session. Logout → login. A tampered cookie → login with the expired message. `next` param open-redirect attempt (`//evil.com`) is ignored.
9. **Admin preview save:** edit the tagline → Save → info toast "weren't saved" → field reverts. Reload shows the original value. Invalid email → inline error, no request is sent.
10. **Rebrand:** start the API with `BRAND_SEED=e2e/fixtures/brand-acme.json` (name "Acme Works", short name "Acme", legal name "Acme Works Ltd."). On every public and admin route, the visible text, `<title>`, meta and OG tags, JSON-LD and the manifest show the Acme values and **never** match `/shuru|শুরু/i`. The "meaning of the name" block is absent because the fixture has no `nameMeaning`. A second fixture with a 60-char name checks that the header, footer and mobile nav don't overflow at 320px.
11. **No-JS:** with JavaScript disabled, Home renders all sections, nav links work, and the contact form submits via the server action.
12. **404:** an unknown route and an unknown plan slug render the 404 page with status 404.

## Conventions

- Selectors: `getByRole`, `getByLabel` and `getByText`. Use `data-testid` only when no accessible handle exists.
- Each test is independent. The API runs with `NODE_ENV=test`, seed data, throttling limits raised except in throttle-specific tests, and a fixed `ADMIN_PASSWORD_HASH` for the test password `test-password-123`.
- Disable animations in visual tests (`animations: 'disabled'`, `reducedMotion: 'reduce'`) and wait for `document.fonts.ready`.
- Flaky tests are fixed or quarantined with an issue link within one day. Retries (2) are on in CI only.

## CI pipeline (GitHub Actions)

`install → lint → typecheck → unit (contracts, web, api) with coverage → build → api integration → playwright (sharded by project) → lighthouse-ci → upload reports`

The merge is blocked on any failure, a coverage drop below the floor, any axe violation or a missed Lighthouse budget.

> **Why Vitest for the API:** NestJS 12 ships ESM-only, and its official ESM starter uses Vitest. Jest would need `--experimental-vm-modules`. Using Vitest everywhere also gives one runner, one config style and one coverage tool (`@vitest/coverage-v8`).
