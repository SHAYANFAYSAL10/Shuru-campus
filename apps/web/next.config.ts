import { fileURLToPath } from 'node:url';

import createMDX from '@next/mdx';

import { securityHeaders } from './src/lib/security/csp';
import { SITE_URL } from './src/lib/site-url';

import type { NextConfig } from 'next';

const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The Docker image (apps/web/Dockerfile) ships the self-contained server. Off otherwise, so
  // `next start` keeps working. Tracing starts at the repo root to pick up workspace packages.
  ...(process.env.BUILD_STANDALONE === 'true' && {
    output: 'standalone',
    outputFileTracingRoot: fileURLToPath(new URL('../..', import.meta.url)),
  }),
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

// Legal pages are MDX (content/legal). Turbopack needs serialisable options, so the remark
// plugin is passed as a path, which the loader imports.
const withMDX = createMDX({
  options: {
    remarkPlugins: [fileURLToPath(new URL('./src/lib/mdx/remark-legal.mjs', import.meta.url))],
  },
});

export default withMDX(nextConfig);
