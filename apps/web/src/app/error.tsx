'use client';

import { useBrand } from '@/components/providers/brand-provider';
import { ErrorSection } from '@/components/sections/error-section';
import { MAIN_CONTENT_ID } from '@/lib/navigation';
import { type BoundaryError } from '@/lib/report-error';

/**
 * A layout below the root failed (e.g. the site shell itself), so there is no header or footer
 * to keep: the error stands alone, centred in the viewport.
 */
export default function RootError({ error, retry }: { error: BoundaryError; retry: () => void }) {
  const brand = useBrand();
  return (
    <main id={MAIN_CONTENT_ID} className="grid min-h-dvh items-center pt-safe pb-safe">
      <title>{`Something went wrong · ${brand.name}`}</title>
      <ErrorSection error={error} retry={retry} />
    </main>
  );
}
