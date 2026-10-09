# 09 — Roadmap & Open Questions

## Phase 1: Website + read-only admin (current)

The step-by-step task list (milestones M0–M9, task IDs, dependencies and acceptance criteria) is in **[11-implementation-plan.md](11-implementation-plan.md)**.

## Phase 2: Persistence

PostgreSQL (e.g. Neon) + Prisma or Drizzle behind the existing repository interfaces. Persistent admin edits with cache revalidation, inquiry storage + email notifications (Resend/SES), multiple admin users and roles, an audit log and image uploads.

## Phase 3: Product

Online booking for meeting and seminar rooms (availability calendar), payments (SSLCommerz / bKash), events page, Bangla locale, and analytics with a consent banner.

## Open questions for the client ⚠️

| # | Question | Default until answered |
| --- | --- | --- |
| 1 | Is this site for Shuru Campus itself, or a new brand using Shuru's content as reference? | Build as **Shuru Campus** by default. The brand name, logo and legal name are one config (`brand`), so a rename is a one-file change. |
| 2 | Logo files and brand guidelines? Keep the existing logo? | Wordmark set in Fraunces until supplied |
| 3 | High-resolution photos + usage rights | Placeholder images at final aspect ratios |
| 4 | What does Executive Seating "Premium ৳17,000" add? | Shown as a separate rate labeled "Premium" with no extra features |
| 5 | Seminar Room: both "up to 14" and "up to 20" are ৳3,000/hr. Is that correct? | Shown as listed, flagged in seed with a `TODO(client)` |
| 6 | Private Office says "1–6 people" but only lists 3/4/6 | Show the listed tiers + "Other sizes: contact us" |
| 7 | Where should inquiries go (email address) once email is enabled? | info@shurucampus.com |
| 8 | Is "40 Mbps" still accurate? (It's dated for 2026.) | Shown as listed |
| 9 | Do member sign-in and sign-up still use OfficeRnD? | Yes, links configurable |
| 10 | Legal text review by counsel before launch | Verbatim text with a "Last updated" date (the capture date, 2026-10-07, until the client gives the real ones). Flagged for counsel: the Refund Policy's cut-off sentence ("All payments submitted through this website at"), its "for the following reasons:" with no reasons after it, "broached" and "fellowships" |
| 11 | Hosting target (Vercel + Render/Fly/Railway, or a single VPS with Docker)? | Dockerfiles for both apps + a Vercel-ready web |
