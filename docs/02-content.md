# 02 — Content Inventory

Source: [shurucampus.com](https://www.shurucampus.com/), captured 2026-10-07. This is the **source of truth for facts** (prices, contacts, policies). Copywriting may be refreshed, but facts may not change without client confirmation. Items marked ⚠️ need client confirmation (see `09-roadmap.md`).

Seed data in `packages/contracts/src/seed/*.ts` must match this file exactly.

## Brand

These are the **default values of the brand config** (`packages/contracts/src/seed/brand.ts`). The brand name is configurable. Nothing in the code or copy hard-codes it (see `03-architecture.md` → Brand configuration).

| Field (`brand.*`) | Value |
| --- | --- |
| `name` | Shuru Campus |
| `shortName` | Shuru |
| `legalName` | Shuru Campus Ltd. |
| `nameMeaning` | শুরু (Bangla, language tag `bn`) = "beginning" |
| `tagline` | Shared Workspace & Beyond |
| `subTagline` | Designed for Work Empowerment, Enhancement & Enrichment |
| `pillars` | Empower · Enhance · Enrich |

## Contact & location

| Field | Value |
| --- | --- |
| Address | Wakil Tower (8th Floor), Ta-131 Gulshan – Badda Link Road, Gulshan, Dhaka-1212 |
| Phones | +88 09666-731731, +88 01700-766084 |
| Email | info@shurucampus.com |
| Hours | Saturday–Thursday 9:00–19:00 · Friday closed |
| Timezone | `Asia/Dhaka` (UTC+6, no DST). All "open now" logic uses this. |
| Facebook | https://www.facebook.com/ShuruCampus/ |
| Instagram | https://www.instagram.com/shurucampus/ |
| X / Twitter | https://twitter.com/ShuruCampus |
| Member sign in | https://shuru-campus.officernd.com/login |
| Member sign up | https://shuru-campus.officernd.com/signup |

## About copy (reference)

> Shuru is a co-working facility that endeavors to provide a unique space and environment for businesses, entrepreneurs & independent professionals. Here, they can share a common workspace, as well as other office services. We provide a professional, tranquil and buoyant atmosphere designed to enhance, empower & enrich your work activity.

> Looking for a head-start in your business? Looking to start a company? Have an immediate problem with space? Looking for somewhere to work when you are travelling? Contact Shuru Campus. Let us help you deal with your issues.

- **Who we are:** "We are dreamers who want to use imagination & creativity to simplify the journey of a business or entrepreneur."
- **Shared economy:** "A sharing economy is an economic model in which individuals are able to borrow or rent assets owned by someone else… most likely to be used when the price of a particular asset is high and the asset is not fully utilized all the time." (Investopedia)
- **Co-working:** "A style of work that involves a shared working environment, often an office, and independent activity. Unlike in a typical office environment, those co-working are usually not employed by the same organization." (Wikipedia)

## Amenities

Wi-Fi (up to 40 Mbps) · Projector / TV · Meeting Room · Locker · Silent Room · Café · Timeout Zone · Lunch · Print / Copy / Scan · Unlimited Tea & Coffee · Front Desk

## Plans & pricing (BDT)

Currency is shown as `৳` with `en-BD` grouping, e.g. `৳10,000`. Store prices as **integers in BDT**, never floats.

### Hot Desk — `hot-desk`
- **For:** Freelancers, independent & travelling professionals
- **Rates:** ৳100 / hour · ৳650 / day
- **Includes:** Designated hot-desk seating, Silent Room & Timeout Zone access, up to 40 Mbps internet, Print/Copy/Scan, unlimited tea/coffee

### Business Seating — `business-seating`
- **For:** Entrepreneurs & business owners
- **Rates:** ৳2,800 / week · ৳10,000 / month
- **Includes:** Designated seating space, up to 40 Mbps internet, Print/Copy/Scan, unlimited tea/coffee, locker, **1 hour free** meeting room per month

### Executive Seating — `executive-seating`
- **For:** Start-ups & small companies
- **Rates:** ৳4,000 / week · ৳14,000 / month · Premium ৳17,000 / month ⚠️ *(what Premium adds is not stated)*
- **Includes:** Dedicated cubicle seating, Print/Copy/Scan, up to 40 Mbps internet, unlimited tea/coffee, cabinet, complimentary locker, complimentary front desk service, **2 hours free** meeting room per month

### Private Office — `private-office`
- **For:** Satellite teams, companies of 1–6 people
- **Rates:** 3 people ৳40,000 / month · 4 people ৳50,000 / month · 6 people ৳60,000 / month ⚠️ *(no 1–2 or 5 person option is listed even though "1–6" is advertised)*
- **Includes:** Dedicated space, flexible seating for 2–6, up to 40 Mbps internet, Print/Fax/Scan, unlimited tea/coffee, complimentary cabinet, basic front desk service

### Meeting Room — `meeting-room`
- **For:** Conferences, board meetings
- **Rates:** Big (10 people) ৳1,000 / hour · Small (6 people) ৳500 / hour · Mini (3 people) ৳300 / hour
- **Includes:** Snacks/lunch ordering, up to 40 Mbps internet, Smart TV multimedia, unlimited tea/coffee, basic front desk service

### Seminar Room — `seminar-room`
- **For:** Seminars, events, workshops, training sessions
- **Rates:** Up to 14 people ৳3,000 / hour · Up to 20 people ৳3,000 / hour ⚠️ *(same price as 14, likely a typo)* · Up to 30 people ৳10,000 / 4 hours
- **Includes:** Up to 40 Mbps internet, Print/Copy/Scan, unlimited tea/coffee, projector/TV

### Data model hint

```ts
// packages/contracts — illustrative, see 06-api.md for the real schema
Plan {
  slug, name, audience: string[], summary,
  rates: { label?: string; amountBdt: number; unit: 'hour'|'day'|'week'|'month'|'block'; unitLabel?: string; capacity?: number }[],
  features: { title: string; detail?: string }[],
  highlight?: boolean, order: number
}
```

## Policies

The full text of the Privacy Policy, Terms & Conditions and Refund Policy (with the company name replaced by `<Brand field="legalName" />`) is preserved in `apps/web/content/legal/*.mdx` (copied from the reference site's modals). Key facts:

- **Terms:** The agreement is a serviced-office agreement, not a lease. No signage without approval. Keys and cards remain company property. No cooking appliances, hazardous materials, firearms, animals (except assistance animals) or smoking anywhere. Business attire and conduct are expected. No overnight stays. A returned or declined payment costs **৳2,000**. Packages must be collected within 48 hours. The IT policy prohibits unlawful use and security violations, and there's no SLA on internet.
- **Refund:** Requests are answered within **48 hours** (2 business days). Cancel/void requests must arrive before 6:00 PM on the payment date and at least 48 hours before the service starts. Provide your name, the payment date/time, the authorization code, the card's last 4 digits and the statement ID.
- **Privacy:** Personal info is collected to provide and customize the service, and cookies are used. Data is not sold. It's disclosed only for legal compliance, enforcing terms or fraud protection.

> Legal copy should be reviewed by the client's counsel before launch. The reference text has grammatical issues ("broached", "fellowships"). Don't silently rewrite legal text. Flag it instead.

## Media

The reference site has three photos (`home_slider/01–03.JPG`). ⚠️ We need high-resolution originals and usage rights from the client. Until then, use clearly marked placeholder imagery (`/public/placeholder/*`) at the correct aspect ratios so layouts are final.
