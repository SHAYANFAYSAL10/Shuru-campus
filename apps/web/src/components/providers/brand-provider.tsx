'use client';

import { createContext, use, type ReactNode } from 'react';

import type { Brand } from '@campus/contracts';

// Loaded on every page, so client-side Zod is configured before anything parses.
import '@/lib/zod-config';

const BrandContext = createContext<Brand | null>(null);

/** Filled once in the root layout from `getBrand()`, so client components never fetch it. */
export function BrandProvider({ brand, children }: { brand: Brand; children: ReactNode }) {
  return <BrandContext value={brand}>{children}</BrandContext>;
}

/** The brand for client components. Server Components call `getBrand()` from `@/lib/api`. */
export function useBrand(): Brand {
  const brand = use(BrandContext);
  if (brand === null) throw new Error('useBrand() must be used inside <BrandProvider>.');
  return brand;
}
