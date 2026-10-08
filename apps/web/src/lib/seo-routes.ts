import { type FeatureFlags } from '@campus/contracts';

import { LEGAL_NAV, primaryNav } from '@/lib/navigation';
import { absoluteUrl, SITE_URL } from '@/lib/site-url';

import type { MetadataRoute } from 'next';

const SPACES_HREF = '/spaces';

/**
 * Every public page, in site-map order: home, the primary nav (gallery behind its flag) with each
 * plan's page after Spaces, then the legal pages. Admin and the styleguide are never listed.
 */
export function publicPaths(
  features: Pick<FeatureFlags, 'gallery'>,
  planSlugs: readonly string[],
): string[] {
  return [
    '/',
    ...primaryNav(features).flatMap(({ href }) =>
      href === SPACES_HREF ? [href, ...planSlugs.map((slug) => `${SPACES_HREF}/${slug}`)] : [href],
    ),
    ...LEGAL_NAV.map(({ href }) => href),
  ];
}

/** robots.txt: crawl the public site, never the admin console, API or styleguide. */
export function robotsRules(base: URL = SITE_URL): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/_styleguide'] }],
    sitemap: absoluteUrl('/sitemap.xml', base),
  };
}
