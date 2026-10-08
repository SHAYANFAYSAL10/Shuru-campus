import { SiteShell } from '@/components/layout/site-shell';
import { NotFoundSection } from '@/components/sections/not-found-section';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page not found' };

/** Unmatched URLs render here, outside the `(site)` layout, so this adds the site shell itself. */
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundSection />
    </SiteShell>
  );
}
