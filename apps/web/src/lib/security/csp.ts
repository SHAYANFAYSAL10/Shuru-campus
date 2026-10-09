/**
 * Content Security Policy and the other response security headers (docs/03-architecture.md →
 * Security model). `src/proxy.ts` sets the CSP per request, with a fresh nonce; next.config.ts
 * sets the static headers on every response.
 */

/** Request header carrying the nonce to Server Components (`headers().get(NONCE_HEADER)`). */
export const NONCE_HEADER = 'x-nonce';

/** A fresh, unguessable nonce: 128 random bits, base64. */
export function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

export interface CspOptions {
  nonce: string;
  /** `next dev`: React needs `eval` to rebuild server error stacks in the browser. */
  dev: boolean;
  /** Only an https site asks the browser to upgrade requests (it would break plain-http hosts). */
  https: boolean;
}

/**
 * The policy for HTML responses.
 *
 * - Scripts: only those carrying this response's nonce. Next.js reads the nonce from the request's
 *   CSP header and puts it on its own scripts; the root layout passes it to the theme and
 *   announcement boot scripts. `'strict-dynamic'` lets those scripts load the route chunks.
 * - Styles: `'unsafe-inline'`, because React writes `style` attributes (motion, CSS variables)
 *   that a nonce can't cover, and browsers ignore `'unsafe-inline'` once a nonce is listed.
 *   Style injection can't run code, so this is the usual trade.
 * - Everything else is same-origin. The browser only talks to the web origin (the API is
 *   proxied under /api), images are optimized by next/image and fonts are self-hosted.
 *   A third-party embed (e.g. the map on Contact) must be added here explicitly.
 */
export function buildCsp({ nonce, dev, https }: CspOptions): string {
  const directives: [string, ...string[]][] = [
    ['default-src', "'self'"],
    [
      'script-src',
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...(dev ? ["'unsafe-eval'"] : []),
    ],
    ['style-src', "'self'", "'unsafe-inline'"],
    ['img-src', "'self'", 'data:', 'blob:'],
    ['font-src', "'self'"],
    ['connect-src', "'self'"],
    ['manifest-src', "'self'"],
    ['frame-src', "'none'"],
    ['object-src', "'none'"],
    ['base-uri', "'self'"],
    ['form-action', "'self'"],
    ['frame-ancestors', "'none'"],
  ];
  if (https) directives.push(['upgrade-insecure-requests']);
  return directives.map((directive) => directive.join(' ')).join('; ');
}

/** Static headers for every response (next.config.ts). */
export function securityHeaders({ https }: Pick<CspOptions, 'https'>) {
  return [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // Nothing on the site needs these. Geolocation stays off: "Open in Google Maps" is a link.
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
    },
    // Legacy twin of `frame-ancestors 'none'`, for browsers without CSP 2.
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    ...(https
      ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
      : []),
  ];
}
