# 01 — Product Brief

## What we're building

This is a new marketing website and lightweight admin console for **Shuru Campus Ltd.**, a co-working space in Gulshan, Dhaka. The current site, [shurucampus.com](https://www.shurucampus.com/), is the **content reference only**. The design is a fresh, original direction.

The brand name is **configurable** (see `03-architecture.md` → Brand configuration) and defaults to Shuru Campus. *Shuru* (শুরু) means **"beginning"** in Bangla. The brand idea is simple: *this is where work begins.* The design, copy and motion all grow from that idea (see `04-design-system.md`).

## Audiences

| Audience | What they need in under 30 seconds |
| --- | --- |
| Freelancers and travelling professionals | Can I drop in today? What does an hour or a day cost? Is the Wi-Fi good? |
| Entrepreneurs and business owners | Monthly seat options, a business address, meeting room hours included |
| Start-ups and small teams (1–6) | Private office pricing per team size, a dedicated space, front desk |
| Event organizers and trainers | Meeting and seminar room capacity, hourly rates, AV, catering |
| **Staff (admin)** | Sign in, see site configuration, and later edit it |

## Goals

1. **Convert.** Every page has a clear path to *Book a visit* or *Send an inquiry*. Plan cards carry the plan into the inquiry form.
2. **Clarify pricing.** Visitors can compare all plans and get a recommendation from the *plan finder*.
3. **Feel premium.** The design and motion quality should impress a UI/UX expert: restrained, purposeful, detailed.
4. **Be robust.** It never breaks from 320px phones to 2560px displays, at any zoom level, in light or dark, with or without motion.
5. **Be future-ready.** A database, real bookings and a member portal can be added without rewrites.

## Phase 1 scope

**In scope**
- Public pages: Home, Spaces & Pricing, About, Gallery, Contact, Legal (Privacy, Terms, Refund) and 404
- Plan finder, a live "open now" status in Dhaka time, the inquiry and contact form (validated; the API accepts it but doesn't store or email it)
- Light and dark theme, reduced-motion support
- Admin: login, logout, session, dashboard and **read-only** configuration screens. Edit forms validate, but saving doesn't persist (clearly labeled).
- NestJS API serving all content from seed data
- Full test suite (unit, integration, e2e, accessibility, responsive)

**Out of scope (later phases)**
- Database, persistent admin edits, email delivery, real bookings and payments
- Member sign-in and sign-up. In Phase 1 these link to the existing OfficeRnD portal, and the URLs are configurable.
- CMS-managed blog or events, multi-location, i18n (Bangla). The architecture should not block these.

## Success criteria

- Lighthouse mobile scores ≥ 95 for Performance, Accessibility, Best Practices and SEO on every public page
- 0 axe violations, 0 horizontal overflow across the device matrix
- Inquiry form completes in ≤ 3 interactions from any plan card
- The client (UI/UX expert) signs off on the design review without structural changes
