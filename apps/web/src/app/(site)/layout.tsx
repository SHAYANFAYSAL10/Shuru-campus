import { MAIN_CONTENT_ID, SiteHeader } from '@/components/layout/site-header';

import type { ReactNode } from 'react';

/** Public site shell: header above every page. `<main>` clears the fixed header. */
export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteHeader />
      {/* Focusable so the skip link moves focus here, without a focus ring of its own. */}
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="pt-(--header-offset) outline-none">
        {children}
      </main>
    </>
  );
}
