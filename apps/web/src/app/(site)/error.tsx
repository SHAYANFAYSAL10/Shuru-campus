'use client';

import { useBrand } from '@/components/providers/brand-provider';
import { ErrorSection } from '@/components/sections/error-section';
import { type BoundaryError } from '@/lib/report-error';

/** A public page failed to render: the error replaces the page, inside the site shell. */
export default function SiteError({ error, retry }: { error: BoundaryError; retry: () => void }) {
  const brand = useBrand();
  return (
    <>
      <title>{`Something went wrong · ${brand.name}`}</title>
      <ErrorSection error={error} retry={retry} />
    </>
  );
}
