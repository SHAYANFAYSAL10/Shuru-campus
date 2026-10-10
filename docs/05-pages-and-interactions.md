# 05 — Pages & Interactions

> `{name}`, `{shortName}` and `{legalName}` in copy below refer to the configurable brand (`06-api.md` → `Brand`). Never type the brand name into components or copy.

Every page shares a **header** (logo, nav, `OpenStatus`, theme toggle, "Member login" link → OfficeRnD, primary CTA "Book a visit") and a **footer** (address, phones, email, hours, socials, legal links, a large "Let's begin." sign-off in Fraunces).

The header is transparent over the hero. On scroll it condenses (height 80→64px) and gains a translucent surface (`backdrop-filter`, solid fallback). It hides on scroll-down and shows on scroll-up, but never while focus is inside it.

---

## Home `/`

| # | Section | Content | Interaction |
| --- | --- | --- | --- |
| 1 | **Hero** | "Your *[startup]* begins here." / sub: "Shared workspace & beyond, in the heart of Gulshan." / CTAs: *Find your space* · *Book a visit* / meta row: `OpenStatus`, "From ৳100/hr", "Sat–Thu 9–7" | Word cycle with pause control, begin-line draw, hero image slow scale (1.05→1) |
| 2 | **Manifesto** | "Empower · Enhance · Enrich": three short statements drawn from the About copy | Words fade from `fg-subtle` to `fg` as they scroll into view (scroll-linked; static under reduced motion) |
| 3 | **Spaces** | 6 plan cards (Hot Desk → Seminar Room), each with audience, "from" price and 3 key features | Card hover lift + image reveal. Click → plan sheet (shared-element). Horizontal snap carousel below `md` with prev/next buttons. |
| 4 | **Plan finder** | 3 questions: *Who's working?* (just me / 2–6 people / event group) · *How often?* (hours · days · weekly · monthly) · *Need?* (desk / private room / meeting) → recommended plan + price + CTA | `SegmentedControl` springs, the result card animates in with `layout`. Pure function `recommendPlan()` is unit-tested. |
| 5 | **Amenities** | 11 amenities with icons | Bento grid on desktop; marquee row on mobile (drifts, swipeable, pausable; static under reduced motion) |
| 6 | **A day at {shortName}** | 9:00 arrive & coffee · 10:00 deep work (Silent Room) · 13:00 lunch · 15:00 meeting room · 17:00 timeout zone · 19:00 close | On the lake band. Horizontal timeline (snap scroll, prev/next buttons until `xl`); while open, the begin line runs from opening to the **current Dhaka time** with a "Now" marker, moving each minute; the moment in reach is highlighted as the rail (or, from `xl`, the page) scrolls |
| 7 | **Gallery teaser** | 5 photos in an asymmetric grid | Opens the lightbox |
| 8 | **Why co-working** | Shared economy and co-working explainers (with citations) as two editorial columns | Pull-quote reveal |
| 9 | **Visit us** | Map (static image + "Open in Google Maps" link; no heavy embed until click), address, hours table with today highlighted, phones, email | Click-to-call/copy email with a toast |
| 10 | **CTA band** | "Ready when *you* are." + inquiry button, with a phone number as the alternative (a call button when the inquiry form is off). Not "Ready to begin?": the footer's "Let's begin." follows right below, and the brand thread is once per screen (B5). | Magnetic CTA |

## Spaces & Pricing `/spaces`

- Intro + **period filter** (`Hourly · Daily · Weekly · Monthly`, synced to `?period=`; nothing chosen shows every plan). It hides plans without a matching rate and highlights the matching rates (block rates count as hourly), says what it shows (`aria-live`) and offers "Show all plans". Without JS it is a GET form. Each plan leads with a price under its name that follows the period (its lowest rate paid by it; "From" when there's more than one), and its digits roll when the period changes (the odometer, T6.3); the summary line reads the new prices out.
- Plan sections (anchor IDs = slugs) with rates, an "Included" checklist and capacity.
- **Comparison table** (features × plans, features grouped into rows by kind; what every plan includes is said once in the lead). From `lg` a table whose header sticks under the site header; it fits the page, so it never scrolls sideways and the first column needs no sticking. Below `lg`, stacked cards (a 7-column table is too cramped at `md`).
- Each rate's "Book this" → `/contact?plan=<slug>&rate=<rateId>` (the stable rate ID, matching `InquiryCreate.rateId`), which pre-fills the inquiry.
- FAQ accordion (business address use, refund window, opening hours incl. Friday closed, guests, internet speed), with content from the Terms and Refund policies.

**`/spaces/[slug]`**: a deep-linkable plan detail page with the same content, used for SEO and shared-element navigation from cards. A breadcrumb ("Spaces & pricing › {plan}", with BreadcrumbList JSON-LD) leads in; below the plan, "Need a different *size*?" suggests the three plans nearest it in the lineup as plan cards (a snap carousel until `lg`) with "Compare all plans". `generateStaticParams` comes from the plans list, and unknown slugs → 404.

## About `/about`

Story ("We are dreamers…") beside an editorial photo, the meaning of the name (only when `brand.nameMeaning` is set: the word at display size in its own script and `lang`, on the lake band), the Empower/Enhance/Enrich pillars, the shared-economy and co-working explainers and "Who it's for" (4 audience tiles, each one link to the matching plan with its "from" price, or to Spaces when plans fail to load), then the CTA band.

## Gallery `/gallery`

A masonry grid (CSS columns; no JS layout), filter chips (*All · Workspace · Meeting rooms · Café · Events*, synced to `?category=`; without JS they submit a GET form) with a `layout` re-flow animation, a polite live summary ("Showing 3 photos of the café."), and a lightbox (keyboard, swipe, counter, captions, focus restore). An empty category says "Nothing in *Events* yet. Try *Workspace*." with a button to it. Images are lazy below the fold. With `features.gallery` off the page is a 404.

## Contact `/contact`

- **Inquiry form:** name, email, phone (optional, lenient validation, BD example as placeholder), interest (one select of plans and their rates, grouped by plan, pre-filled from `?plan=&rate=`; it sets both `planSlug` and `rateId`), preferred start date (optional, today to a year ahead), team size (optional), message, hidden honeypot.
- Validation uses the Zod schema shared with the API, on blur + submit, and focus moves to the first error.
- States: idle → submitting (button keeps its width, spinner) → **success** (the form morphs into a confirmation card: "Thanks, {name}. We'll reply within one business day.") / **error** (inline banner, inputs preserved, retry).
- Works without JS: the form posts to the same server action the JS path calls, and the page returns with errors marked and the first focused, or with the confirmation.
- With `features.inquiryForm` off, the form gives way to call and email buttons.
- Side panel: address, phones, email, hours, `OpenStatus`, map link.

## Legal `/legal/privacy` · `/legal/terms` · `/legal/refund`

MDX rendered with a readable prose style, a sticky table of contents on desktop (scroll-spy) and "Last updated". Pills link the three policies. Below `lg` the contents are a closed "On this page" disclosure; a policy with fewer than two sections (Privacy) has none. Print stylesheet included: ink on white, no header, footer or on-screen navigation, link URLs printed.

## 404 / error

The 404 page reads "This page hasn't begun yet." with a begin line that draws and fails to connect, plus links to Home and Spaces. The error boundary offers a friendly message and a retry button, and logs a digest.

---

## Admin `/admin` (see `07-admin.md`)

| Route | Content |
| --- | --- |
| `/admin/login` | Email + password, show/hide password, error states, throttling message, `?next=` redirect |
| `/admin` | Dashboard: greeting, phase banner ("Preview mode: changes aren't saved yet"), cards linking to each config area, system health (API status, data source = memory, version) |
| `/admin/settings` | General: site name, tagline, contact, hours, socials, member-portal URLs |
| `/admin/pricing` | Plans and rates (table view + edit drawer) |
| `/admin/features` | Feature flags: announcement banner (text + toggle), inquiry form on/off, gallery on/off, maintenance mode |

The admin UI uses the same tokens, denser (`text-small` default, compact spacing), with a sidebar on desktop and a top bar plus sheet on mobile.

## Interaction checklist (applies everywhere)

- Every async action has pending, success and error feedback within 100ms of the click.
- Destructive or irreversible actions confirm. Phase 1 has none on the public site.
- Focus returns to the trigger after closing any overlay.
- Toasts are announced via `aria-live="polite"`, auto-dismiss after 5s, pause on hover/focus and can be dismissed.
- Clicked phone numbers use `tel:`, and emails offer copy-to-clipboard + `mailto:`.
