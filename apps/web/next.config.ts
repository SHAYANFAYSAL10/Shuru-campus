import { securityHeaders } from './src/lib/security/csp';
import { SITE_URL } from './src/lib/site-url';

import type { NextConfig } from 'next';

const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The browser only ever talks to the web origin; /api/* is proxied to the API
  // so the admin cookie stays first-party (docs/03-architecture.md).
  rewrites() {
    return Promise.resolve([{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }]);
  },
  // Static security headers on every response. The CSP is per request (src/proxy.ts).
  headers() {
    const headers = securityHeaders({ https: SITE_URL.protocol === 'https:' });
    return Promise.resolve([{ source: '/:path*', headers }]);
  },
};

export default nextConfig;
