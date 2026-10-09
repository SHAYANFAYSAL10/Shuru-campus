import NextLink from 'next/link';

import { cn } from '@/lib/cn';
import { LEGAL_DOCS, legalHref, type LegalSlug } from '@/lib/legal';

export interface LegalDocNavProps {
  current: LegalSlug;
  className?: string;
}

/**
 * The three legal pages side by side, as pills (the current one filled and `aria-current`), so a
 * reader moves between policies without the footer.
 */
export function LegalDocNav({ current, className }: LegalDocNavProps) {
  return (
    <nav aria-label="Legal documents" className={className}>
      <ul className="flex flex-wrap gap-2">
        {LEGAL_DOCS.map((doc) => {
          const isCurrent = doc.slug === current;
          return (
            <li key={doc.slug}>
              <NextLink
                href={legalHref(doc.slug)}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'hit-target inline-flex h-9 items-center rounded-full border px-4 text-small font-medium whitespace-nowrap transition-colors duration-fast',
                  isCurrent
                    ? 'border-fg bg-fg text-bg'
                    : 'border-border-strong text-fg hover:bg-bg-alt',
                )}
              >
                {doc.title}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
