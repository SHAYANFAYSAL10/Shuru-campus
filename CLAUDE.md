# Engineering Instructions

These rules apply to everyone working in this repo, human or AI. If a rule blocks you, raise it. Don't quietly work around it.

The client is a **UI/UX expert**. Assume every pixel, transition and empty state will be inspected. "Works" is not done. **Done** means it works, it's polished, it's accessible, it's responsive and it's tested.

---

## 1. Before you write code

1. Pick the next task from `docs/11-implementation-plan.md` and read the docs it references. If the doc and the code disagree, fix one of them in the same change.
2. Content comes from `docs/02-content.md` and the seed data. Never invent prices, phone numbers or policies.
3. Design values come from tokens (`docs/04-design-system.md`; color in `docs/10-design-guidelines.md`). **No magic numbers** for color, spacing, radius, shadow, z-index, duration or easing.
4. **Never hard-code the brand name** ("Shuru", "Shuru Campus", "Shuru Campus Ltd.") in code, copy, metadata or tests. Use `getBrand()` / `useBrand()` (`brand.name`, `brand.shortName`, `brand.legalName`). Internal identifiers stay brand-neutral (`@campus/*`, `admin_session`). CI enforces this (`docs/03-architecture.md` → Brand configuration).

## 2. Repo conventions

- Monorepo with npm workspaces: `apps/web` (Next.js), `apps/api` (NestJS), `packages/contracts` (Zod + types).
- TypeScript `strict: true` everywhere, plus `noUncheckedIndexedAccess`. No `any`. If you truly need an escape hatch, use `unknown` and narrow it.
- Every data shape that crosses the network is defined **once** as a Zod schema in `@campus/contracts`. Types come from `z.infer`. Don't hand-write duplicate interfaces.
- File names are `kebab-case.ts(x)`. React components are `PascalCase` exports. Use one component per file unless the helpers are private.
- Use absolute imports through path aliases (`@/components/...`). Never use `../../../`.
- Conventional Commits (`feat(web): ...`, `fix(api): ...`, `docs: ...`, `test: ...`).
- Keep PRs small and focused. Each PR updates the docs it affects.

## 3. Frontend rules (apps/web)

**Rendering**
- Server Components by default. Add `"use client"` only for components that need state, effects, browser APIs or motion. Push client boundaries as far down the tree as possible.
- Fetch data in Server Components through the typed client in `src/lib/api`. Never call `fetch` ad hoc from components.
- Public pages (`(site)`) arrive as complete HTML: **no route-level `loading.tsx`** above their content, because a streamed Suspense boundary needs JS to reveal it and no-JS visitors would see the skeleton forever. Skeletons belong to client islands and non-essential `<Suspense>` parts (`OpenStatus` before hydration). Admin routes may use `loading.tsx`. Every route has `error.tsx`. Provide `not-found.tsx` at the root.
- Generate `metadata` for every page (title, description, Open Graph). Add JSON-LD `LocalBusiness` on Home and Contact.

**Styling**
- Tailwind CSS v4, with theme tokens defined in CSS (`@theme`). Use the token utilities. Arbitrary values (`w-[37px]`) need a comment explaining why.
- Mobile-first. Write base styles for 320px and layer up with `sm: md: lg: xl: 2xl:`. Use container queries (`@container`) for components that live in different-width slots.
- Use fluid type and spacing with the `clamp()` tokens. Never set fixed heights on anything that contains text.
- Use `min-h-dvh`, not `h-screen`, so mobile browser chrome doesn't break layouts.
- Respect safe areas (`env(safe-area-inset-*)`) on fixed and sticky UI.

**Motion**
- Use `motion` (`motion/react`) for component animation and Lenis for optional smooth scrolling.
- **Animate only `transform` and `opacity`** (plus `clip-path` and `filter` sparingly). Never animate `width`, `height`, `top` or `left`. Use `layout` animations instead.
- Every animation honors `prefers-reduced-motion`. Reduced means instant or a simple crossfade, never removed content. Use the shared `useReducedMotion` wrapper.
- Durations and easings come from `src/styles/motion.ts` tokens only.
- Motion must never block reading. Content is visible without JS, so don't start content at `opacity: 0` in SSR HTML unless it's progressive (see design doc §6).

**Accessibility (WCAG 2.2 AA minimum)**
- Use semantic HTML first. Use ARIA only when no native element exists.
- Everything is keyboard-operable with a visible `:focus-visible` ring. There are no hover-only affordances.
- Hit targets are at least 44×44px on touch.
- Text contrast is at least 4.5:1, and UI and large text at least 3:1, in **both** light and dark themes.
- Images have meaningful `alt` text, or `alt=""` when decorative.
- Forms have labels, inline errors linked with `aria-describedby`, and focus moves to the first error on submit.
- Layouts reflow with no horizontal scroll at 320 CSS px and at 200% and 400% zoom.

**Performance budgets**
- LCP < 2.0s, CLS < 0.05 and INP < 200ms on a mid-tier mobile (Lighthouse mobile profile).
- First-load JS per route stays under 180 KB gzipped. Lazy-load heavy client components (`next/dynamic`) such as the gallery lightbox and plan finder.
- Use `next/image` for every raster image with explicit `sizes`, and `next/font` for fonts. Ship no layout shift from fonts or images.

## 4. Backend rules (apps/api)

- Use feature modules (`site`, `plans`, `inquiries`, `auth`, `admin-config`, `health`). A controller does HTTP only. Logic lives in services.
- **Data access only through repository interfaces** injected by token (e.g. `PLANS_REPOSITORY`). Phase 1 uses in-memory implementations backed by seed files. The DB later becomes a new implementation, and no service or controller changes.
- Validate every request body, query and param with the Zod schema from `@campus/contracts` via `ZodValidationPipe`. Validate the env at boot. The app refuses to start with an invalid config.
- Errors use one consistent JSON shape (`docs/06-api.md`). Never leak stack traces or internal messages in production.
- Security defaults: Helmet, strict CORS (the web origin only), `@nestjs/throttler` (stricter on `/auth/login` and `/inquiries`), httpOnly + Secure + SameSite cookies and Origin checks on mutations.
- Never log secrets, passwords, tokens or full PII. Use the structured logger with request IDs.
- All routes are prefixed `/api/v1`. Breaking changes need a new version.

## 5. Testing rules

See `docs/08-testing.md`. In short:
- New logic needs unit tests. New endpoints need integration tests (supertest). New pages and flows need Playwright coverage.
- Every page passes the **no-horizontal-overflow** and **axe** checks across the full device matrix.
- Test behavior, not implementation. Query by role and label, not class or test-id, unless there's no accessible handle.
- Don't commit `.only` or skipped tests without a linked reason.
- Coverage floor is 80% lines for `packages/contracts`, `apps/api/src` and `apps/web/src/lib`.

## 6. Definition of Done (checklist for every PR)

- [ ] `npm run lint && npm run typecheck && npm test` pass
- [ ] Playwright passes on the full device matrix
- [ ] Checked by hand at 320, 768, 1280 and 1920 widths, in light and dark, at 200% zoom and with reduced motion
- [ ] Keyboard-only walkthrough works, and screen-reader labels make sense
- [ ] Loading, empty, error and success states are designed, not default
- [ ] No console errors or warnings, no hydration warnings
- [ ] Docs are updated if behavior or contracts changed

## 7. Things not to do

- Don't add a database, ORM or migration in Phase 1.
- Don't make admin "save" actually persist in Phase 1 (see `docs/07-admin.md`).
- Don't add UI libraries that bring their own design language (MUI, Bootstrap, Chakra). Headless primitives (Radix) are fine.
- Don't use scroll-jacking that takes scroll control away from the user, or autoplay audio, carousels without pause controls or parallax that causes motion sickness.
- Don't commit secrets. Use `.env.example` for documenting variables.
