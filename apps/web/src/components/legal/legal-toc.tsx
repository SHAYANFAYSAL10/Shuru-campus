'use client';

import * as m from 'motion/react-m';
import { useEffect, useId, useState } from 'react';

import { cn } from '@/lib/cn';
import { activeSection, type TocEntry } from '@/lib/legal';
import { ease, seconds } from '@/styles/motion';

/** A section counts as being read once its heading passes this far down the viewport. */
const READING_LINE = 1 / 3;

export interface LegalTocProps {
  /** The page's sections, titles already filled with the brand. */
  entries: readonly TocEntry[];
  className?: string;
}

/**
 * "On this page" for a legal page on wide screens (docs/05 → Legal): links to each section, with
 * the one being read marked (scroll-spy: `aria-current="location"`, full-strength text and an
 * accent bar that slides between entries, transform only; reduced motion makes it jump).
 * Without JS it's a plain list of anchor links.
 */
export function LegalToc({ entries, className }: LegalTocProps) {
  const titleId = useId();
  const [active, setActive] = useState(-1);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const tops = entries.map(
        ({ id }) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity,
      );
      const root = document.documentElement;
      const atEnd =
        window.scrollY > 0 && window.innerHeight + window.scrollY >= root.scrollHeight - 2;
      setActive(activeSection(tops, window.innerHeight * READING_LINE, atEnd));
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [entries]);

  return (
    <nav aria-labelledby={titleId} className={className}>
      <p id={titleId} className="type-eyebrow text-fg-subtle">
        On this page
      </p>
      <ol className="mt-4 border-l border-border">
        {entries.map((entry, index) => {
          const current = index === active;
          return (
            <li key={entry.id} className="relative">
              {current ? (
                <m.span
                  aria-hidden="true"
                  layoutId={`${titleId}-marker`}
                  transition={{ duration: seconds('base'), ease: ease.out }}
                  // Over the rail's 1px border, twice as thick.
                  className="absolute inset-y-1 -left-px w-0.5 rounded-full bg-accent"
                />
              ) : null}
              <a
                href={`#${entry.id}`}
                aria-current={current ? 'location' : undefined}
                className={cn(
                  'flex min-h-hit items-center rounded-sm py-2 pl-4 text-small text-pretty transition-colors duration-fast hover:text-fg',
                  // Color only: a weight change would re-wrap the entry.
                  current ? 'text-fg' : 'text-fg-muted',
                )}
              >
                {entry.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
