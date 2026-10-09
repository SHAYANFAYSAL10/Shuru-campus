import { robotsRules } from '@/lib/seo-routes';

import type { MetadataRoute } from 'next';

/** /robots.txt */
export default function robots(): MetadataRoute.Robots {
  return robotsRules();
}
