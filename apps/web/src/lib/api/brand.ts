import 'server-only';

import { cache } from 'react';

import { siteSeed, type Brand, type SiteSettings } from '@campus/contracts';

import { getSite } from '@/lib/api/public';

/**
 * Site settings for the layout shell (header, footer). Falls back to the seed when the API is
 * unreachable or answers off-contract, so the shell always renders with real content (the seed
 * mirrors docs/02-content.md). Page content uses the typed fetchers and designs its own error state.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const site = await getSite();
  return site.ok ? site.data : siteSeed;
});

/**
 * The brand for Server Components. Falls back to the seed default when the API is unreachable
 * or answers off-contract, so the name always renders (03-architecture.md → Brand configuration).
 * Client components use `useBrand()` instead.
 */
export const getBrand = cache(async (): Promise<Brand> => (await getSiteSettings()).brand);
