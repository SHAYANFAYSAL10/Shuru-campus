# 04 — Design System

## 1. Concept: "Where work begins"

The default brand name, *Shuru*, means *beginning*. The site should feel like the first morning in a new workspace: **calm, warm light, a fresh page, quiet confidence.** We are not a neon startup or a beige corporate office. We're closer to an editorial magazine about craft, with the tactility of paper and the precision of good furniture.

**Three design principles**

1. **Calm over clever.** Motion and detail reward attention but never demand it. One idea per screen.
2. **Honest and specific.** Real prices, real hours, a live "open now". No vague "contact us for pricing".
3. **Crafted details.** Tabular figures in prices, optical alignment, considered empty and error states, hover states with intent.

**Signature motif: the "begin" line.** A single thin stroke (1.5px, accent color) that *starts* things. It draws under the hero word, marks the current hour on the day timeline, underlines active nav items, and traces the selected plan. It's used consistently and sparingly, and it's the brand's visual signature.

> **If the brand is renamed,** the concept still holds. "Where work begins" is about the first morning at work, not the word. The begin line, palette and motion don't depend on the name. Only the optional "meaning of the name" block on About uses `brand.nameMeaning`.

## 2. Color

Tokens are defined once in `apps/web/src/styles/tokens.css` (imported by `globals.css`) as CSS variables, exposed to Tailwind via `@theme`. Tailwind's default palette, type sizes, radii, shadows and easings are removed, so only token utilities exist (`bg-surface`, `text-h2`, `rounded-md`, `shadow-raise`, `ease-out`, `z-header`, `duration-fast`). **Components use semantic tokens only**, never palette tokens.

The full palette, the semantic tokens for light and dark, the verified contrast matrix and the usage rules live in **[10-design-guidelines.md](10-design-guidelines.md)**, which is the single source of truth for color. In summary:

- **Paper and ink:** warm off-white and warm near-black carry about 90% of every screen.
- **Marigold** (morning sun) is the accent. Use it for fills, the begin line and highlights, and never as text on light backgrounds.
- **Lake green** (Gulshan lake) is the secondary color, used for dark surfaces and the focus ring.
- Dark mode is a **designed** theme, not an inversion.
- Every text and UI pair is checked by `contrast.test.ts`.

## 3. Typography

| Role | Family | Notes |
| --- | --- | --- |
| Display | **Fraunces** (variable: `opsz`, `SOFT`, `WONK`) | Editorial serif with warmth. Use `opsz` 72–144 for headlines, `SOFT 50`. Italic for emphasis words ("*begins*"). |
| Text / UI | **Geist Sans** (variable) | Neutral, precise, excellent at small sizes |
| Numeric / Meta | **Geist Mono** | Hours, eyebrow labels, small captions |

Loaded through `next/font` (self-hosted, `display: swap`, subset `latin`, metrics-adjusted fallback → 0 CLS). Prices use `font-variant-numeric: tabular-nums` and lining figures.

**Fluid type scale** (min @ 360px → max @ 1440px, `clamp()`):

| Token | Size | Line-height | Use |
| --- | --- | --- | --- |
| `text-display` | 48 → 128px | 0.95 | Hero only, Fraunces, tracking −0.03em |
| `text-h1` | 40 → 80px | 1.0 | Page titles |
| `text-h2` | 32 → 56px | 1.05 | Section titles |
| `text-h3` | 22 → 28px | 1.2 | Card titles |
| `text-lead` | 18 → 22px | 1.5 | Intro paragraphs |
| `text-body` | 16 → 17px | 1.6 | Body. Never below 16px for paragraphs. |
| `text-small` | 14px | 1.5 | Meta |
| `text-eyebrow` | 12 → 13px | 1.2 | Mono, uppercase, tracking 0.12em |

Measure: body copy is `max-width: 65ch`. Headlines use `text-wrap: balance`, paragraphs `text-wrap: pretty`.

**Type roles in code** (`apps/web/src/styles/base.css`): `type-display`, `type-h1`, `type-h2` and `type-h3` set Fraunces with its size, line-height, tracking and a pinned optical size (144 / 144 / 96 / 72) plus `SOFT 50`. `type-pullquote` is Fraunces at the h3 size but regular weight, 1.3 leading and a hanging opening quote mark. `type-lead` and `type-eyebrow` (Geist Mono, uppercase, 0.12em) cover the rest. The bare `text-*` size utilities stay available for Geist text. Fonts load in `src/styles/fonts.ts`.

## 4. Space, layout and shape

- **Spacing scale (4px base):** 1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64, 20=80, 24=96, 32=128. Section padding is fluid: `clamp(64px, 10vw, 160px)`.
- **Grid:** 4 columns (< 640), 8 columns (640–1024), 12 columns (≥ 1024). Gutter is `clamp(16px, 2.5vw, 32px)`. The page margin is `clamp(16px, 5vw, 80px)`. Content max-width is 1440px, and full-bleed media is allowed.
- **Breakpoints:** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Above 1920, content stays capped and the background extends.
- **Radius:** `--radius-sm 6px` (inputs, chips) · `--radius-md 12px` (cards) · `--radius-lg 24px` (media, large panels) · `--radius-full`.
- **Elevation:** prefer borders and tonal surfaces over shadows. There are two shadows, `--shadow-raise` (hover cards) and `--shadow-overlay` (dialogs, menus), both warm-tinted and low-opacity.
- **Z-index tokens:** `base 0 · raised 10 · sticky 100 · header 200 · overlay 300 · modal 400 · toast 500`.
- **Texture:** a 3% opacity SVG paper-grain overlay on `--color-bg` (fixed, `pointer-events: none`, disabled in forced-colors).

## 5. Components (primitive inventory)

`Button` (primary / secondary / ghost / link; sm / md / lg; loading state preserves width) · `IconButton` · `Link` (animated begin-line underline) · `Field` (`Input`, `Textarea`, `Select`, `SegmentedControl`, `Checkbox`, `Switch`) with label, hint, error · `Card` · `Badge` / `Chip` · `Tabs` · `Dialog` / `Sheet` (mobile) · `Toast` · `Tooltip` (never the only source of info) · `Skeleton` · `Price` (formats BDT, unit, tabular nums) · `OpenStatus` (live dot + label) · `ThemeToggle` · `Logo`.

**Forms are native first.** `Select` is a styled `<select>`, `Checkbox` and `Switch` (`role="switch"`) are real checkboxes, and `SegmentedControl` is a radio group, so the platform pickers, keyboard behavior and no-JS form posts all keep working. `Field` links the label, hint and error to its control (`aria-describedby`, `aria-invalid`), and invalid controls get a danger border and a danger focus ring. Forms use `useZodForm(schema)` from `src/lib/forms`, which validates on blur and then live, and on submit focuses the first invalid field. `applyApiErrors()` maps a `400` response's `details` back onto fields.

Every interactive primitive has these documented states: default, hover, focus-visible, active, disabled, loading, error. A `/_styleguide` dev-only route renders all primitives in all states and themes, and it's used by the visual tests.

## 6. Motion

Motion explains **where things come from and what changed.** It's never decoration for its own sake.

### Tokens (`src/styles/motion.ts`)

| Token | Value | Use |
| --- | --- | --- |
| `duration.instant` | 100ms | Press feedback, color changes |
| `duration.fast` | 180ms | Hovers, small toggles |
| `duration.base` | 320ms | Component enter/exit, tabs |
| `duration.slow` | 560ms | Section reveals, overlays |
| `duration.story` | 900ms | Hero entrance, line draws |
| `ease.out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default enter |
| `ease.inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` | Moves, layout |
| `ease.in` | `cubic-bezier(0.55, 0, 1, 0.45)` | Exit (keep exits ~70% of enter) |
| `spring.snappy` | `{ stiffness: 400, damping: 30 }` | Toggles, segmented controls |
| `spring.soft` | `{ stiffness: 140, damping: 20 }` | Magnetic, drag |
| `stagger` | 40–60ms | Lists. Cap the total at 400ms. |

### Rules
- **Progressive reveal:** content is in the SSR HTML and visible. The reveal class is added only once JS has hydrated and the element is below the fold, so first-paint content never waits for JS (protects LCP).
- Reveal distance is small (`y: 16–24px`), with opacity 0→1. Each element reveals once and never re-animates on scroll-up.
- Hover effects need `@media (hover: hover) and (pointer: fine)`. Touch devices get press states instead.
- **Reduced motion:** transforms become a crossfade ≤ 150ms. Marquees stop (they become a static wrapped list). Lenis is disabled. Line-draws appear fully drawn.
- No scroll-jacking. Lenis (if enabled) only smooths native scroll and is disabled on touch devices.
- Target 60fps on mid-range Android. Use `will-change` only during the animation.

### Implementation (`apps/web/src/components/motion/`)
- **Reveals are CSS, toggled by one IntersectionObserver hook** (`useProgressiveReveal`). `<Reveal>`, `<SplitText>` and `<BeginLine>` use the `animate-reveal` / `animate-mask-up` / `animate-draw` keyframes from `src/styles/animations.css`, so they add almost no JS. Their `mount` variants run from CSS on first paint, before hydration and without JS.
- **Scroll-linked text is CSS too.** `<ScrollText>` (a Server Component) gives each word its own stretch of the paragraph's view timeline (`styles/scroll-text.css`, `lib/scroll-text.ts`, `scrollText` tokens), animating opacity from `scrollText.dim` (reads as `fg-subtle`, still AA for body text) to 1. It runs without JS; where scroll timelines aren't supported, under reduced motion, in forced colors, with more contrast and in print, the words are plain `fg`.
- **Hover is gated in one place.** Tailwind's `hover:` (and so `group-hover:`) is redefined in `globals.css` to `(hover: hover) and (pointer: fine)`; hand-written `:hover` rules (`link-draw`, `hover-lift`, `hover-raise`) use the same query. `e2e/micro-interactions.spec.ts` fails on any `:hover` rule shipped outside it. Card hovers use `hover-lift` (4px, `translate`, none under reduced motion) and `hover-raise` (the raise shadow on a pseudo-element, opacity only).
- **`motion` is for springs and layout** (`<Magnetic>`, the segmented-control thumb, shared-element transitions). Its features load lazily through `<MotionProvider>` (`LazyMotion strict` + `MotionConfig reducedMotion="user"`), so use `m.*` from `motion/react-m`, never `motion.*`.
- **Reduced motion:** `useReducedMotion()` (`src/lib/hooks/use-media-query.ts`) for JS and the `motion-reduce:` variant for CSS. Reveals render their final state, line-draws appear drawn, `<Marquee>` becomes a wrapped list.
- `<Marquee>` only moves after hydration, when its pause button works. Without JS it's a static list. It drifts by scrolling (`marquee.pxPerSecond`), not by a transform, so people can also swipe, wheel or arrow through it in either direction; it loops seamlessly. The drift holds under the mouse, while focus is inside and while someone scrolls it, then resumes after `marquee.resumeAfter`. Pause stops the drift; the row stays scrollable.
- `<SmoothScroll>` (Lenis) is code-split and loads only on fine pointers without reduced motion. It isn't mounted yet; whether to use it is decided with the layout shell (M4).
- Durations and easings live in `src/styles/motion.ts` and are mirrored as `--duration-*` / `--ease-*` in CSS. `motion.test.ts` keeps the two equal.

### Signature moments
1. **Hero word cycle:** "Your ___ *begins* here." The blank cycles through *startup · big idea · Monday · next chapter* (`HERO_WORDS`, `lib/hero-words.ts`) with a vertical mask-slide every `wordCycle.interval`. It holds while the pointer is on the headline, while the pause button has focus, while the headline is off screen and while the tab is hidden. A visible pause button stops it (WCAG 2.2.2). The words share one grid cell (`styles/word-cycle.css`), so the slot is as wide as the longest word and ends the first line: nothing moves when the word changes (no CLS). Reduced motion: a crossfade. Without JS: "startup", still. Screen readers always get "Your startup begins here."
2. **Begin-line draw:** an SVG `pathLength` 0→1 under the hero word. Leaving Home through the nav, the line flies up and becomes the nav underline. The hero's line records where it was as it unmounts, and the nav underline, mounting in the same commit, animates from there (a transform-only FLIP with the Web Animations API, `lib/begin-line-handoff.ts`). Only a line the reader could see hands off. Between nav items, the underline glides by shared `layoutId`.
3. **Plan card → detail:** a shared-element transition. Following a plan card, its photo grows into the photo on the plan's page. Where the View Transitions API runs, it's React's `<ViewTransition>` sharing `plan-photo-{slug}`, only on a navigation from a card (the `plan-open` transition type), while the rest of the page crossfades. Elsewhere it's a transform-only FLIP like the begin line's (`lib/plan-morph.ts`). Reduced motion: a crossfade in place, natively, or no flight.
4. **Pricing period toggle:** the segmented control's thumb springs, and prices roll digit by digit (odometer, tabular nums so width never jumps).
5. **Day at {shortName} timeline:** a horizontal 9:00→19:00 rail. The begin line marks the **current Dhaka time**, and scroll-linked progress highlights moments (coffee, deep work, meetings, timeout). It's a native horizontal scroll with snap on mobile.
6. **Gallery lightbox:** a shared-layout zoom from thumbnail to fullscreen with swipe, keyboard arrows and Esc, and focus is trapped and restored.
7. **Magnetic primary CTA:** a ≤ 6px pull toward the cursor (capped in every direction, corners included: `magneticOffset()`, `lib/magnetic.ts`) on fine pointers only, mouse and pen (not touch on a hybrid). It lets go at once if reduced motion is switched on.

## 7. Imagery and iconography

- Photography is warm, natural light, people mid-task (not posing), with shallow depth of field. Aspect ratios are 4:5 (portrait cards), 3:2 (feature) and 16:9 (hero/full-bleed).
- `next/image` with `placeholder="blur"`, explicit `sizes` and AVIF/WebP.
- Icons are **Lucide** at a 1.5px stroke to match the begin line, sized 16/20/24. Custom amenity icons follow the same grid.

## 8. Responsive and resilience rules

- Design and verify at **320, 375, 414, 768, 1024, 1280, 1440, 1920 and 2560** px, plus landscape phone (844×390).
- At 320px nothing truncates critical info. Long words wrap (`overflow-wrap: anywhere` on user-generated content and emails).
- Browser zoom 200% and 400% reflow without horizontal scroll (WCAG 1.4.10). Text spacing overrides (WCAG 1.4.12) don't clip content.
- Navigation is a full-screen sheet below `lg`, with a focus trap, `Esc` to close and scroll lock that preserves position.
- Tables (pricing comparison) become stacked cards below `lg`. They never scroll sideways without a visible affordance.
- `forced-colors: active` (Windows High Contrast) keeps borders and focus rings visible.
- It works without JS: all content is readable, links work and the contact form posts via a server action fallback. So public pages have no route-level `loading.tsx` (streamed content needs JS to reveal); their data is cached (60s) and awaited before the HTML is sent.
