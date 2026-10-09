import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { getSiteSettings } from '@/lib/api';
import { MAIN_CONTENT_ID } from '@/lib/navigation';

import type { ReactNode } from 'react';

/**
 * Public site shell: the fixed header, then (clearing it) the announcement bar, the page and the
 * footer. The column fills the viewport, so the footer sits at the bottom of short pages. Used by
 * the `(site)` layout and by the root 404, which renders outside that layout.
 */
export async function SiteShell({ children }: Readonly<{ children: ReactNode }>) {
  const site = await getSiteSettings();

  return (
    <>
      <SiteHeader />
      <div className="flex min-h-dvh flex-col pt-(--header-offset)">
        <AnnouncementBar announcement={site.announcement} />
        {/* Focusable so the skip link moves focus here, without a focus ring of its own. */}
        <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
