'use client';

import { useRef, type ReactNode } from 'react';

import { useHeaderScroll } from '@/lib/hooks/use-header-scroll';

export interface HeaderShellProps {
  /** Keeps the header in view (e.g. while its mobile menu is open). */
  pinned?: boolean;
  children: ReactNode;
}

/**
 * The fixed `<header>` and its scroll states: transparent at the top, condensed with a
 * translucent surface once scrolled, hidden on scroll-down and back on scroll-up, never while
 * focus is inside. The styles live in `src/styles/header.css`; this only sets data attributes.
 */
export function HeaderShell({ pinned = false, children }: HeaderShellProps) {
  const ref = useRef<HTMLElement>(null);
  const { condensed, hidden } = useHeaderScroll(ref, pinned);

  return (
    <header
      ref={ref}
      data-site-header=""
      data-condensed={condensed ? '' : undefined}
      data-hidden={hidden ? '' : undefined}
      className="fixed inset-x-0 top-0 z-header pt-(--header-shift)"
    >
      <div
        aria-hidden="true"
        data-header-surface=""
        className="pointer-events-none absolute inset-0"
      />
      {/* Safe area on the row, so the notch never covers it once the header slides up. */}
      <div data-header-row="" className="relative pt-[env(safe-area-inset-top)]">
        {children}
      </div>
    </header>
  );
}
