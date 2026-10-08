# 07 — Admin Console

## Purpose (Phase 1)

Staff can **sign in** and **see** the site's configuration exactly as the public site uses it. Edit forms exist and validate, so the client can review the UX, but saving **doesn't persist**. This is explicit in the UI, not a silent failure.

## Authentication

### Setup

```bash
npm run admin:hash -- 'a-strong-password'
# → $argon2id$v=19$m=65536,p=4,t=3$...
# put it in apps/api/.env as ADMIN_PASSWORD_HASH (quote it), with ADMIN_EMAIL
```

In dev only, if `ADMIN_PASSWORD_HASH` is missing, the API refuses to start and prints the command above. There's no default password, ever.

### Flow

1. The user opens `/admin/*`. If the `admin_session` cookie is missing, `proxy.ts` redirects to `/admin/login?next=/admin/...`.
2. They submit the login form. `POST /api/v1/auth/login` is proxied to Nest, which verifies the email (case-insensitive) and the argon2 hash.
3. On success, Nest sets the httpOnly JWT cookie and the web redirects to `next`. `next` is validated to be a same-site `/admin` path, so there are no open redirects.
4. The console layout (Server Component) calls `/auth/me`. On `401` it clears the cookie and redirects to login with "Your session has expired."
5. Logout runs `POST /auth/logout`, clears the cookie and redirects to `/admin/login` with a toast.

### UX details

- Show/hide password toggle, `autocomplete="username"` and `current-password`, no paste blocking.
- Errors: wrong credentials gives a uniform message. Rate limiting says "Too many attempts. Try again in N seconds" (from `Retry-After`). A network error gives a retry option.
- The login page is `noindex`, and so is all of `/admin`.

## Configuration screens

Every screen shows a persistent **Preview mode** banner:

> **Preview mode.** You can explore and edit these settings, but changes are not saved yet. Saving will be enabled when the database is connected.

| Screen | Fields | Validation highlights |
| --- | --- | --- |
| **General** `/admin/settings` | **Brand:** name, short name, legal name, tagline, sub-tagline, pillars, name meaning (optional), logo (wordmark or image URL), with a live preview of the header and footer. **Contact:** address lines, phones (list), email, opening hours per weekday (open/close or closed), social URLs, member portal URLs | Brand names are non-empty with length limits (name ≤ 60, short name ≤ 24). Email format, phones in BD format, `close > open`, URLs must be https |
| **Pricing** `/admin/pricing` | Plans table (name, from-price, rate count, highlight). The edit drawer covers summary, audience tags, rates (amount, unit, capacity) and features (reorderable). | Amounts are positive integers, at least one rate, unique slugs |
| **Features** `/admin/features` | Announcement banner (toggle + text + link), inquiry form toggle, gallery toggle, maintenance mode toggle (with a description of its effect) | Announcement text ≤ 120 chars when enabled |

### Save behavior in Phase 1

1. The form tracks dirty state. **Save** is enabled only when something has changed, and a "Discard changes" option is available.
2. On save, the client validates (Zod) and sends a PUT. The server validates again.
3. Validation errors are shown inline (the same path → field mapping as the public forms).
4. On `202 { persisted: false }`, an info toast (not success-green) says: "Looks good. Changes are valid but weren't saved (preview mode)." The form **resets to server values**, with a subtle highlight on the fields that reverted, so nobody mistakes it for a save.
5. Navigating away with unsaved edits triggers a confirmation (`beforeunload` + in-app route guard).

### Phase 2 (DB) changes needed

- Repository `update()` implementations, with `persisted: true` and `200` responses.
- After a save, `revalidateTag('site' | 'plans')` via a web route handler called by the API (or a shared secret webhook).
- Multiple admin users and roles (`owner`, `editor`), password reset and an audit log.
- Image upload for gallery and plan images.
