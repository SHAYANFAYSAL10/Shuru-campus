import 'server-only';

import { cache } from 'react';

import { defaultBrand, type Brand } from '@campus/contracts';

import { getSite } from '@/lib/api/public';

/**
 * The brand for Server Components. Falls back to the seed default when the API is unreachable
 * or answers off-contract, so the name always renders (03-architecture.md → Brand configuration).
 * Client components use `useBrand()` instead.
 */
export const getBrand = cache(async (): Promise<Brand> => {
  const site = await getSite();
  return site.ok ? site.data.brand : defaultBrand;
});
