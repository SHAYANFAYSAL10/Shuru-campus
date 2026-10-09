import 'server-only';

import { SITE_URL } from '@/lib/site-url';

/** Where the Next server reaches the API (docs/03-architecture.md → Environment variables). */
export const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:4000';

/** Sent as `Origin` on server-side mutations; the API's OriginGuard checks it (06-api.md). */
export const SITE_ORIGIN = SITE_URL.origin;

export const API_BASE = `${API_ORIGIN}/api/v1`;

/** Default deadline for a call. Rendering waits on it, so it stays short. */
export const DEFAULT_TIMEOUT_MS = 3000;

/** Matches the API's `Cache-Control: max-age=60` on public GETs. */
export const PUBLIC_REVALIDATE_S = 60;
