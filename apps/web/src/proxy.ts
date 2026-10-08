import { NextResponse, type NextRequest } from 'next/server';

import { buildCsp, createNonce, NONCE_HEADER } from '@/lib/security/csp';
import { SITE_URL } from '@/lib/site-url';

const CSP_HEADER = 'Content-Security-Policy';

/**
 * Runs before every page render: a fresh nonce and the CSP that allows it. The CSP goes on the
 * request too, which is where Next.js reads the nonce for its own scripts; Server Components read
 * it from `x-nonce`. Static headers live in next.config.ts.
 */
export function proxy(request: NextRequest) {
  const nonce = createNonce();
  const csp = buildCsp({
    nonce,
    dev: process.env.NODE_ENV === 'development',
    https: SITE_URL.protocol === 'https:',
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set(CSP_HEADER, csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(CSP_HEADER, csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: not the proxied API, build assets, or metadata files (robots, sitemap, OG
      // image, icons), which run no scripts.
      source:
        '/((?!api/|_next/static|_next/image|favicon.ico|icon|apple-icon|robots.txt|sitemap.xml|opengraph-image|twitter-image).*)',
      // Prefetches carry no HTML to protect.
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
