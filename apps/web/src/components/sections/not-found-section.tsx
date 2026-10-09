import NextLink from 'next/link';

import { BrokenBeginLine } from '@/components/motion/broken-begin-line';
import { buttonClasses } from '@/components/ui/button-classes';

/**
 * The 404 page body (docs/05-pages-and-interactions.md → 404 / error): "This page hasn't begun
 * yet." over a begin line that fails to connect, then the two best places to go. Rendered by
 * both not-found files, inside the site shell.
 */
export function NotFoundSection() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="mx-auto max-w-content py-section px-page-safe"
    >
      <p className="type-eyebrow text-fg-muted">404 · Page not found</p>
      <h1 id="not-found-title" className="mt-6 max-w-4xl type-h1 text-balance text-fg">
        This page hasn’t <em>begun</em> yet.
      </h1>
      <BrokenBeginLine delay={200} className="mt-10 max-w-md" />
      <p className="mt-10 max-w-xl type-lead text-fg-muted">
        The link may be out of date, or the address may have a typo. These are good places to go
        instead.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <NextLink href="/" className={buttonClasses()}>
          Go to the home page
        </NextLink>
        <NextLink href="/spaces" className={buttonClasses({ variant: 'secondary' })}>
          See spaces and pricing
        </NextLink>
      </div>
    </section>
  );
}
