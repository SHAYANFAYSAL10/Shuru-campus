import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { MAIN_CONTENT_ID } from '@/lib/navigation';

import type { ReactNode } from 'react';

/**
 * Public site shell: the fixed header, then (clearing it) the page and the footer.
 * The column fills the viewport, so the footer sits at the bottom of short pages.
 */
export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <div className="flex min-h-dvh flex-col pt-(--header-offset)">
        {/* Focusable so the skip link moves focus here, without a focus ring of its own. */}
        <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
