# 06 — API Contract

Base path: `/api/v1`. JSON only. All schemas live in `@campus/contracts`. This document describes them, and the code is authoritative.

Outside production, interactive docs are served at `/api/docs` (OpenAPI JSON at `/api/docs-json`), generated from the same Zod schemas. Container image: `docker build -f apps/api/Dockerfile .` from the repo root.

## Conventions

- **Success:** the resource or collection directly. Collections return `{ items: T[] }`.
- **Error** (every non-2xx):

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Some fields are invalid.",
    "details": [{ "path": "email", "message": "Enter a valid email address." }],
    "requestId": "c0a8…"
  }
}
```

| HTTP | `code` |
| --- | --- |
| 400 | `VALIDATION_FAILED` |
| 401 | `UNAUTHENTICATED` |
| 403 | `FORBIDDEN` (e.g. bad Origin) |
| 404 | `NOT_FOUND` |
| 429 | `RATE_LIMITED` (+ `Retry-After` header) |
| 500 | `INTERNAL` (no internals leaked) |

- Every response carries `X-Request-Id`. A safe incoming `X-Request-Id` (8–64 chars of `[A-Za-z0-9_-]`) is reused so web and API logs correlate. Otherwise the API generates a UUID.
- Public GET responses send `Cache-Control: public, max-age=60, stale-while-revalidate=600`. Everything else (admin, auth, inquiries, `/health` and all errors) sends `no-store`.
- **Every mutation** (`POST`, `PUT`, `PATCH`, `DELETE`, including `/inquiries` and `/auth/*`) must carry an `Origin` in `WEB_ORIGINS`, or, when `Origin` is absent, a `Referer` on one of them. Otherwise it's `403 FORBIDDEN`. Browsers send `Origin` themselves. The web app's server-side API client must set it explicitly (e.g. to `NEXT_PUBLIC_SITE_URL`).
- Bodies are JSON only (100 KB max). Malformed or oversized bodies return `400 VALIDATION_FAILED` with a message saying which.

## Public endpoints

| Method | Path | Response | Notes |
| --- | --- | --- | --- |
| GET | `/health` | `{ status: 'ok', version, dataSource: 'memory', uptimeS }` | Used by admin dashboard and monitoring |
| GET | `/site` | `SiteSettings` | Name, taglines, contact, hours, socials, portal links, announcement, feature flags (public subset) |
| GET | `/plans` | `{ items: Plan[] }` | Ordered by `order` |
| GET | `/plans/:slug` | `Plan` | 404 if unknown |
| GET | `/amenities` | `{ items: Amenity[] }` | |
| GET | `/gallery` | `{ items: GalleryImage[] }` | `?category=` optional |
| POST | `/inquiries` | `202 { id, receivedAt }` | Throttled 5/min/IP. Honeypot filled → `202` with no-op (don't tip off bots). Phase 1: validated + logged (redacted), not stored. |

### Key schemas (summary)

```ts
SiteSettings {
  brand: Brand;
  contact: { addressLines: string[]; phones: string[]; email: string; mapUrl: string };
  hours: { timezone: 'Asia/Dhaka'; weekly: { day: 0..6; open: 'HH:mm' | null; close: 'HH:mm' | null }[] };
  socials: { platform: 'facebook'|'instagram'|'x'; url: string }[];
  memberPortal: { loginUrl: string; signupUrl: string };
  announcement: { enabled: boolean; text: string; href?: string };
  features: { inquiryForm: boolean; gallery: boolean; maintenanceMode: boolean };
}

Brand {
  name: string (1..60);          // "Shuru Campus": logo wordmark, <title>, OG, JSON-LD, footer
  shortName: string (1..24);     // "Shuru": in copy, e.g. "A day at {shortName}"
  legalName: string (1..120);    // "Shuru Campus Ltd.": legal pages, copyright
  tagline: string; subTagline: string;
  pillars: string[] (1..4);      // ["Empower", "Enhance", "Enrich"]
  nameMeaning?: { word: string; language: string; meaning: string }; // optional; hides the "meaning of the name" block when absent
  logo: { kind: "wordmark" } | { kind: "image"; src: string; srcDark?: string; alt: string };
}

Plan {
  slug: string; name: string; summary: string; audience: string[];
  rates: { id: string; label?: string; amountBdt: number /* int */; unit: 'hour'|'day'|'week'|'month'|'block';
           blockHours?: number; capacity?: number }[];
  features: { title: string; detail?: string }[];
  imageId: string; highlight: boolean; order: number;
}

Amenity { id; name; description; icon: string /* lucide name */ }
GalleryImage { id; src; width; height; alt; category: 'workspace'|'meeting'|'cafe'|'events'; blurDataUrl }

InquiryCreate {
  name: string (2..80); email: email; phone?: string (6..20, digits/+/-/space);
  planSlug?: PlanSlug; rateId?: string; teamSize?: int 1..100; preferredDate?: ISO date (today..+1y);
  message: string (10..2000); website?: string /* honeypot, must be empty */
}
```

## Auth endpoints

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| POST | `/auth/login` | `{ email, password }` | `200 { user: { email, role: 'admin' } }` + `Set-Cookie: admin_session=…` · `401` uniform message · throttled 5/min/IP |
| POST | `/auth/logout` | none | `204` + cookie cleared |
| GET | `/auth/me` | none | `200 { user }` or `401` |

## Admin endpoints (require `AdminGuard`)

| Method | Path | Response |
| --- | --- | --- |
| GET | `/admin/config` | `AdminConfig` = `{ site: SiteSettings; plans: Plan[]; meta: { dataSource: 'memory'; editable: false; updatedAt } }` |
| PUT | `/admin/config/site` | Body `SiteSettings` → **`202 { persisted: false, validated: true, message }`** |
| PUT | `/admin/config/plans/:slug` | Body `Plan` → **`202 { persisted: false, validated: true, message }`**. `400` if `body.slug` ≠ `:slug` (slugs can't change), `404` for an unknown plan |
| PUT | `/admin/config/features` | Body `SiteSettings['features'] & { announcement }` → **`202 { persisted: false, … }`** |

Phase 1 PUTs **validate fully** (so the UI's error handling is real and tested) but don't change anything. A follow-up `GET` returns the original values. In Phase 2 they return `200` with the updated resource, the contract shape stays the same and `persisted` becomes `true`.

Like every mutation, these require `Origin` ∈ `WEB_ORIGINS` (`403 FORBIDDEN` otherwise, see Conventions).
