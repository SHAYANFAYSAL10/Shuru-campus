# 10 — Design & Color Guidelines

This is how to *apply* the design system. `04-design-system.md` defines the concept, type, spacing and motion tokens, and this document defines **color** (the source of truth) and the rules for putting a screen together. Use it while designing and while reviewing PRs.

---

## Part A — Color

### A1. The idea behind the palette

| Color | Inspiration | Role | Share of a screen |
| --- | --- | --- | --- |
| **Paper** | A fresh notebook page, warm morning light | Background, surfaces | ~70% |
| **Ink** | Fountain-pen ink, warm and not pure black | Text, icons, hairlines | ~20% |
| **Lake** | Gulshan lake, calm deep green | Dark sections, focus, secondary emphasis | ~7% |
| **Marigold** | Morning sun, gãda flowers in Dhaka markets | The accent: the begin line, primary CTAs, highlights | **≤ 3%** |

**Marigold's power comes from scarcity.** If more than one marigold element competes for attention in a viewport (aside from the begin line), remove one.

### A2. Palette (raw values)

Raw values are **never** used directly in components. They exist only to build the semantic tokens in A3.

| Token | Hex | Notes |
| --- | --- | --- |
| `paper` | `#F7F4EE` | Page background (light) |
| `paper-2` | `#EFEAE0` | Sunken surfaces, alternate sections |
| `white` | `#FFFFFF` | Raised surfaces: cards, inputs, dialogs |
| `ink` | `#16150F` | Primary text |
| `ink-2` | `#55524A` | Secondary text |
| `ink-3` | `#6B675F` | Tertiary text, meta, placeholders |
| `line` | `#DCD5C8` | Decorative hairlines and dividers |
| `line-strong` | `#857F74` | Input borders and control outlines (≥ 3:1) |
| `marigold` | `#E8A33D` | Accent fill |
| `marigold-ink` | `#8A5A0E` | Accent as text on light |
| `marigold-tint` | `#FBEBD0` | Highlight backgrounds (e.g. "Popular" plan) |
| `lake` | `#1F4E4A` | Secondary, dark sections, focus ring (light) |
| `lake-tint` | `#E8EFEE` | Info backgrounds |
| `lake-light` | `#7FB8B0` | Lake on dark backgrounds |
| `lake-night` | `#2A3D3A` | Info backgrounds (dark) |
| `night` | `#12110E` | Page background (dark) |
| `night-2` | `#1B1A16` | Raised surfaces (dark) |
| `night-3` | `#0D0C0A` | Sunken surfaces (dark) |
| `night-line` | `#2E2C26` | Hairlines (dark) |
| `night-line-strong` | `#77716A` | Input borders (dark) |
| `parchment` | `#F3EFE7` | Primary text (dark) |
| `parchment-2` | `#B9B3A7` | Secondary text (dark) |
| `parchment-3` | `#8F897D` | Tertiary text (dark) |
| `sun` | `#F0B355` | Accent (dark): slightly lighter and softer than marigold |
| `sun-tint` | `#3A2C14` | Highlight backgrounds (dark) |
| `success` / `success-dark` | `#276B44` / `#6FBF8E` | Status |
| `danger` / `danger-dark` | `#B3261E` / `#F2867E` | Status |

### A3. Semantic tokens (what components use)

| Token | Light | Dark | Use for |
| --- | --- | --- | --- |
| `--color-bg` | paper | night | Page background |
| `--color-bg-alt` | paper-2 | night-3 | Alternating sections, sunken wells |
| `--color-surface` | white | night-2 | Cards, inputs, menus, dialogs |
| `--color-fg` | ink | parchment | Headlines, body |
| `--color-fg-muted` | ink-2 | parchment-2 | Supporting text, descriptions |
| `--color-fg-subtle` | ink-3 | parchment-3 | Meta, captions, placeholders, eyebrows |
| `--color-border` | line | night-line | Dividers, card outlines (decorative) |
| `--color-border-strong` | line-strong | night-line-strong | Inputs, checkboxes, segmented controls |
| `--color-accent` | marigold | sun | Primary CTA fill, begin line, active indicators |
| `--color-on-accent` | ink | ink | Text and icons on the accent fill |
| `--color-accent-text` | marigold-ink | sun | Accent-colored text and links |
| `--color-accent-subtle` | marigold-tint | sun-tint | Highlight background |
| `--color-brand` | lake | lake-light | Secondary emphasis, icons, eyebrows on feature sections |
| `--color-brand-surface` | lake | lake (`#1F4E4A`) | Dark feature sections (the "lake band") |
| `--color-on-brand` | paper | parchment | Text on the lake band |
| `--color-info-subtle` | lake-tint | lake-night | Info banners (admin "Preview mode") |
| `--color-focus` | lake | sun | Focus ring |
| `--color-success` | success | success-dark | Success text and icons |
| `--color-danger` | danger | danger-dark | Errors, destructive actions |

Three derived tokens complete the set. They are built from the ones above, so they need no extra contrast rows:

| Token | Value | Use for |
| --- | --- | --- |
| `--color-accent-hover` | `color-mix(in oklab, accent, ink 6%)` | Primary button hover (A6) |
| `--color-on-brand-hover` | white (both themes) | Button-on-lake-band hover (A6) |
| `--color-scrim` | ink at 48% (light) · night-3 at 72% (dark) | Behind dialogs and sheets |

**How theming works in code** (`apps/web/src/styles/tokens.css`): each semantic token is declared once as `light-dark(var(--palette-…), var(--palette-…))` and resolves against the element's `color-scheme`. `:root` follows the OS (so the right theme shows even without JS), and next-themes puts `.light` or `.dark` on `<html>`. Both classes also work on any subtree, which is how `/_styleguide` shows the two themes side by side. Browsers without `light-dark()` (Safari < 17.5) fall back to the light theme.

> In dark mode `--color-brand-surface` stays lake (`#1F4E4A`), not lake-light. The lake band reads as a deep, calm section in both themes. In dark mode it's separated from the page by a `night-line` hairline because it's only 2.0:1 against `night`.

### A4. Verified contrast matrix

Ratios were computed with the WCAG 2.x formula. **AA text** needs ≥ 4.5 (≥ 3.0 for text ≥ 24px, or ≥ 18.66px bold). **UI components** (borders, icons, focus rings) need ≥ 3.0. `apps/web/src/lib/color/contrast.test.ts` parses `tokens.css` and asserts every row, plus every allowed semantic pairing in both themes.

**Light**

| Foreground | Background | Ratio | Allowed for |
| --- | --- | --- | --- |
| ink | paper | 16.66 | All text |
| ink-2 | paper | 7.11 | All text |
| ink-2 | paper-2 | 6.51 | All text |
| ink-3 | paper | 5.13 | All text |
| ink-3 | paper-2 | 4.70 | All text |
| ink-3 | white | 5.63 | All text |
| marigold-ink | paper | 5.39 | Text, links |
| marigold-ink | white | 5.92 | Text, links |
| marigold-ink | paper-2 | 4.93 | Text, links |
| marigold-ink | marigold-tint | 5.04 | Text ("Popular" badge) |
| ink | marigold | 8.48 | Text on primary CTA |
| ink | marigold-tint | 15.59 | Text |
| ink | lake-tint | 15.69 | Text on info banners and badges |
| lake | paper | 8.51 | Text, focus ring |
| lake | white | 9.35 | Text, focus ring |
| paper | lake | 8.51 | Text on the lake band |
| lake | lake-tint | 8.02 | Info banner text |
| success | paper / paper-2 / white | 5.85 / 5.35 / 6.42 | Text |
| danger | paper / paper-2 / white | 5.95 / 5.45 / 6.54 | Text |
| line-strong | paper / paper-2 / white | 3.62 / 3.31 / 3.97 | Input borders only |
| marigold | lake | 4.33 | Focus ring on the lake band |
| **marigold** | **paper** | **1.96** | ❌ **Never text, never a meaningful UI boundary.** Fills, decoration and the begin line only. |
| **line** | **paper** | **1.33** | ❌ Decorative dividers only. Never an input border. |

**Dark**

| Foreground | Background | Ratio | Allowed for |
| --- | --- | --- | --- |
| parchment | night | 16.46 | All text |
| parchment | night-2 | 15.18 | All text |
| parchment-2 | night | 9.05 | All text |
| parchment-3 | night | 5.43 | All text |
| parchment-3 | night-2 | 5.01 | All text |
| parchment-3 | night-3 | 5.63 | All text |
| sun | night / night-2 / night-3 | 10.15 / 9.36 / 10.51 | Text, links, focus ring |
| ink | sun | 9.83 | Text on primary CTA |
| sun | sun-tint | 7.28 | Text ("Popular" badge) |
| parchment | sun-tint | 11.81 | Text |
| lake-light | night / night-2 | 8.44 / 7.78 | Text, icons |
| parchment | lake-night | 10.02 | Info banner text |
| parchment | lake | 8.15 | Text on the lake band; lake text on the band's parchment button |
| success-dark | night-2 | 7.89 | Text |
| danger-dark | night / night-2 | 7.63 / 7.04 | Text |
| night-line-strong | night / night-3 / night-2 | 3.92 / 4.05 / 3.61 | Input borders |
| sun | lake | 5.02 | Focus ring on the lake band |
| **night-line** | **night** | **1.35** | ❌ Decorative dividers only |
| **lake** | **night** | **2.02** | ❌ Never text. Lake band needs a hairline edge in dark. |

### A5. Color rules

**Do**
1. **Use one marigold moment per viewport.** That's the primary CTA *or* a highlighted plan *or* the begin line's draw, not all three at full strength.
2. **Pair text by token, not by eye.** `fg` sits on `bg`/`surface`, `on-accent` on `accent`, `on-brand` on `brand-surface`. If a pair isn't in A4, it isn't allowed until it's tested and added.
3. **Carry state with more than color.** Errors get an icon + message, the active nav gets the begin line + `aria-current`, and the "Open now" dot comes with a text label.
4. **Alternate sections** with `bg` → `bg-alt` → `bg`, and use the lake band at most **once per page** (on Home, it's "A day at {shortName}").
5. **Tint photos warm** (`sepia(0.06) saturate(0.95)`) so stock and client photos feel consistent. In dark mode add `brightness(0.9)`.

**Don't**
1. Don't use marigold for text or small icons on light backgrounds (1.96:1).
2. Don't use pure `#000` or `#FFF` as page background or text. They break the warmth. `white` is for raised surfaces only.
3. Don't use gradients as backgrounds. The one allowed gradient is the image scrim (`linear-gradient(to top, rgb(22 21 15 / .6), transparent 60%)`) behind text on photos.
4. Don't use red for anything except errors and destructive actions, and green only for success.
5. Don't add new colors. Propose them in a PR to this file with contrast numbers.

### A6. Color by component

| Component | Rest | Hover (fine pointer) | Active / pressed | Focus-visible | Disabled |
| --- | --- | --- | --- | --- | --- |
| **Button, primary** | `accent` fill, `on-accent` text | fill darkens 6% (`color-mix(in oklab, accent, ink 6%)`), lift −1px | scale 0.98 | 2px `focus` ring, 2px offset | 40% opacity, `cursor: not-allowed`, no hover |
| **Button, secondary** | transparent, `fg` text, `border-strong` 1px | `bg-alt` fill | scale 0.98 | same ring | same |
| **Button, ghost** | transparent, `fg` | `bg-alt` fill | scale 0.98 | same ring | same |
| **Button on lake band** | `paper` fill, `lake` text | paper → white | scale 0.98 | ring in `accent` | same |
| **Link (inline)** | `accent-text`, underline 1px offset 3px | begin line draws (0→100% width via `scaleX`) | — | ring | — |
| **Nav item** | `fg-muted` | `fg` | — | ring | — |
| **Nav item, current** | `fg` + begin line under it | — | — | ring | — |
| **Input** | `surface` fill, `border-strong` 1px | border `fg-subtle` | — | border `focus` + ring | `bg-alt` fill, `fg-subtle` text |
| **Input, invalid** | border `danger` + icon + message in `danger` | — | — | ring `danger` | — |
| **Card** | `surface`, `border` 1px | `shadow-raise`, image scale 1.03 | — | ring on the card's link | — |
| **Card, highlighted plan** | `accent-subtle` background, "Popular" badge (`accent-text` on `accent-subtle`) | same as card | — | — | — |
| **Segmented control** | track `bg-alt`, thumb `surface` + `shadow-raise` | label `fg` | — | ring on the group's active item | — |
| **Toast, info** | `surface`, left 3px `brand` bar, icon `brand` | — | — | — | — |
| **Toast, success / error** | same, with a `success` / `danger` bar and icon | — | — | — | — |
| **Banner, preview mode** | `info-subtle` background, `fg` text, `brand` icon | — | — | — | — |
| **OpenStatus** | Open: `success` dot (pulsing, static when reduced motion) + "Open now". Closed: `fg-subtle` dot + "Closed · opens Sat 9:00". | — | — | — | — |

### A7. Dark mode guidance

- Raise surfaces by getting **lighter** (`night` → `night-2`), not with shadows. Shadows are nearly invisible in dark mode, so lean on borders.
- Reduce marigold's chroma (`sun`) so it doesn't vibrate on near-black.
- Photos get `brightness(0.9)`, and illustrations and icons use tokens, so they adapt automatically.
- Theme switching animates `background-color` and `color` for 180ms on `:root` only, never per-element.
- The theme toggle has 3 states: **System (default) · Light · Dark**, persisted in `localStorage`, with no flash on load (`next-themes` script).

### A8. Special modes

- **`forced-colors: active`** (Windows High Contrast): use system colors (`CanvasText`, `LinkText`, `Highlight`). Every control keeps a 1px `ButtonText` border, the focus ring uses `Highlight`, and the paper-grain texture and image scrims are hidden.
- **`prefers-contrast: more`:** `fg-muted` and `fg-subtle` map to `fg`, borders map to `border-strong`, and the grain is hidden.
- **Print** (legal pages): white background, black text, URLs printed after links, no header or footer chrome.

---

## Part B — Composition guidelines

### B1. Layout

- **Use editorial asymmetry over symmetry.** Prefer a 5/7 or 4/8 column split for text + media over centered everything. Center only the hero sub-copy, CTA bands and empty states.
- **Every section has one job:** one headline, one supporting paragraph (≤ 3 lines at desktop) and at most one primary action.
- **Rhythm:** section padding is the fluid `section` token. Inside sections, headline → body is `space-4`, body → action is `space-8`, and between card rows is `space-6`.
- **Alignment:** text aligns to the grid's column edge, and images can bleed to the page edge. Hang punctuation for pull quotes (`hanging-punctuation: first`).
- **Max line length:** 65ch body, 20ch display headlines (use `text-wrap: balance`).

### B2. Typography in use

- **The display face (Fraunces) is for headlines, pull quotes and big numbers only,** never for UI labels, buttons or forms.
- **Use italic Fraunces for one emphasis word per headline** ("Your startup *begins* here"), typically paired with the begin line.
- **Eyebrows** (Geist Mono, uppercase, `fg-subtle`, or `brand` on feature sections) sit above section titles. Number them on Home (`01 — Spaces`).
- **Prices** are Geist with tabular figures. The `৳` symbol is 0.75em with `fg-muted`, and the unit is `/month` in `text-small` `fg-muted`.
- Sentence case everywhere except eyebrows. No ALL-CAPS buttons.

### B3. Iconography

- Lucide, 1.5px stroke, round caps. Sizes are 16 (inline), 20 (UI) and 24 (feature/amenity).
- Icons inherit `currentColor` and never carry meaning alone. Every icon-only button has an `aria-label` and a tooltip.
- Amenity icons sit inside a 48px `bg-alt` circle. On hover the circle fills with `accent-subtle` and the icon nudges up 2px.

### B4. Imagery

| Use | Ratio | Treatment |
| --- | --- | --- |
| Hero | 16:9 desktop / 4:5 mobile (art-directed with `<picture>`) | `radius-lg`, slow scale-in, scrim only if text overlaps |
| Plan cards | 4:5 | `radius-md`, scale 1.03 on hover |
| Feature / editorial | 3:2 | `radius-lg`, optional 2-image offset stack |
| Gallery | Original ratio | Masonry, `radius-sm` |

Subjects are real work moments, natural light and plants, with people from behind or in candid mid-task shots. Avoid stock clichés (handshakes, pointing at screens, staged high-fives).

### B5. Voice & microcopy

Write **warm, direct and specific.** Short sentences, second person, no jargon or hype.

| Instead of | Write |
| --- | --- |
| Submit | Send inquiry |
| Error occurred | We couldn't send that. Check your connection and try again. |
| Invalid input | Enter a phone number like 01700-766084 |
| No results | Nothing in *Events* yet. Try *Workspace*. |
| Success! | Thanks, Rahim. We'll reply within one business day. |
| Learn more | See Hot Desk pricing |

Follow the brand thread: *begin, start, first day, your next chapter.* Use it in headlines and CTAs, but at most once per screen so it never becomes a gimmick.

### B6. States (designed, never default)

Every data-driven component designs all of these states:

| State | Treatment |
| --- | --- |
| **Loading** | Skeletons matching the final layout (`bg-alt` blocks, shimmer disabled under reduced motion). No spinners for page content. |
| **Empty** | A small line illustration in `fg-subtle`, one helpful sentence and one action |
| **Error** | Inline, close to the cause. Explain what happened and what to do, keep the user's input and offer a retry. |
| **Success** | Confirm in place (a morphing form or a toast). Never send the user to a blank "thank you" page. |
| **Partial / offline** | Cached content with a quiet "Showing saved info" note |

### B7. Review checklist (design PRs)

- [ ] Only semantic color tokens are used, every pair is in the A4 matrix, and there's ≤ 1 marigold moment per viewport
- [ ] The type scale tokens are used, display type is only for headlines, and prices use tabular figures
- [ ] The spacing tokens are used and the grid alignment is correct at 320, 768, 1280 and 1920
- [ ] All states (A6, B6) are designed in light, dark and forced-colors
- [ ] Copy follows B5. No lorem ipsum, and facts come from `02-content.md`.
- [ ] Motion follows `04-design-system.md` §6, with a reduced-motion variant checked
