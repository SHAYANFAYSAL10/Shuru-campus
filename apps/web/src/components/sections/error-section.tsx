'use client';

import { RotateCcw } from 'lucide-react';
import NextLink from 'next/link';
import { useEffect, useRef, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { buttonClasses } from '@/components/ui/button-classes';
import { reportError, type BoundaryError } from '@/lib/report-error';

export interface ErrorSectionProps {
  error: BoundaryError;
  /** The boundary's `retry`: fetches and renders the failed segment again. */
  retry: () => void;
}

/**
 * The error boundary's page body (docs/05-pages-and-interactions.md → 404 / error): what
 * happened, a retry that shows it's working, and a way home. The digest is shown as a reference
 * that matches the server log. Focus moves to the heading so screen readers hear the change.
 */
export function ErrorSection({ error, retry }: ErrorSectionProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [retrying, startRetry] = useTransition();

  useEffect(() => {
    reportError(error);
  }, [error]);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby="error-title"
      className="mx-auto max-w-content py-section px-page-safe"
    >
      <p className="type-eyebrow text-fg-muted">Something went wrong</p>
      <h1
        ref={headingRef}
        id="error-title"
        tabIndex={-1}
        className="mt-6 max-w-4xl type-h1 text-balance text-fg outline-none"
      >
        This page didn’t load.
      </h1>
      <p className="mt-10 max-w-xl type-lead text-fg-muted">
        That’s on our side, not yours. Try again, and if it keeps happening, come back in a few
        minutes.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button
          loading={retrying}
          loadingLabel="Trying again"
          onClick={() => {
            startRetry(retry);
          }}
        >
          <RotateCcw aria-hidden="true" className="size-4" strokeWidth={1.5} />
          Try again
        </Button>
        <NextLink href="/" className={buttonClasses({ variant: 'secondary' })}>
          Go to the home page
        </NextLink>
      </div>
      {error.digest ? (
        <p className="mt-10 text-small text-fg-subtle">
          If you get in touch about this, quote reference{' '}
          <code className="font-mono text-fg-muted">{error.digest}</code>.
        </p>
      ) : null}
    </section>
  );
}
