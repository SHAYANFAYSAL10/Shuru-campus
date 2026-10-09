import { plansSeed } from '@campus/contracts';

import { getPlans, getSiteSettings } from '@/lib/api';
import { publicPaths } from '@/lib/seo-routes';
import { absoluteUrl } from '@/lib/site-url';

import type { MetadataRoute } from 'next';

/** /sitemap.xml. Plans and flags come from the API, falling back to the seed when it's down. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, plans] = await Promise.all([getSiteSettings(), getPlans()]);
  const slugs = (plans.ok ? plans.data : plansSeed).map(({ slug }) => slug);
  return publicPaths(site.features, slugs).map((path) => ({ url: absoluteUrl(path) }));
}
