'use client';

import { ErrorSection } from '@/components/sections/error-section';
import { MAIN_CONTENT_ID } from '@/lib/navigation';
import { type BoundaryError } from '@/lib/report-error';
import { fontVariables } from '@/styles/fonts';

import '@/styles/globals.css';

/**
 * The root layout itself failed, so this replaces the whole document: no brand, theme or shell
 * providers. Colors follow the OS scheme (`:root` in tokens.css), which needs no script.
 */
export default function GlobalError({ error, retry }: { error: BoundaryError; retry: () => void }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <title>Something went wrong</title>
        <main id={MAIN_CONTENT_ID} className="grid min-h-dvh items-center pt-safe pb-safe">
          <ErrorSection error={error} retry={retry} />
        </main>
      </body>
    </html>
  );
}
