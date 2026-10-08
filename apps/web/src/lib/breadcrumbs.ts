import { absoluteUrl, SITE_URL } from '@/lib/site-url';

/** One step of a page's trail: its name and path. */
export interface Crumb {
  name: string;
  path: string;
}

/** The trail as schema.org `BreadcrumbList`, so search results can show it. */
export function breadcrumbJsonLd(trail: readonly Crumb[], base: URL = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path, base),
    })),
  };
}
