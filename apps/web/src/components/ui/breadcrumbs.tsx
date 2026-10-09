import { ChevronRight } from 'lucide-react';
import NextLink from 'next/link';

import { type Crumb } from '@/lib/breadcrumbs';

export interface BreadcrumbsProps {
  /** From the top down; the last crumb is the current page and isn't a link. */
  trail: readonly Crumb[];
  className?: string;
}

/** Where a page sits in the site: an ordered trail of links ending at the current page. */
export function Breadcrumbs({ trail, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-fg-muted">
        {trail.map((crumb, index) => {
          const current = index === trail.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {index > 0 ? (
                <ChevronRight aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
              ) : null}
              {current ? (
                <span aria-current="page" className="text-fg">
                  {crumb.name}
                </span>
              ) : (
                <NextLink
                  href={crumb.path}
                  className="hit-target rounded-sm underline decoration-1 underline-offset-3 transition-colors duration-fast ease-out hover:text-fg hover:decoration-2"
                >
                  {crumb.name}
                </NextLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
