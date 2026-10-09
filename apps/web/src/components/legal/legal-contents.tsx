import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/cn';
import { type TocEntry } from '@/lib/legal';

export interface LegalContentsProps {
  entries: readonly TocEntry[];
  className?: string;
}

/**
 * "On this page" below `lg`, where there's no room for a sticky column: a native disclosure,
 * closed so the policy starts on the first screen, open by keyboard or tap, no JS needed.
 */
export function LegalContents({ entries, className }: LegalContentsProps) {
  return (
    <details className={cn('group rounded-md border border-border bg-surface', className)}>
      <summary className="flex min-h-hit cursor-pointer list-none items-center justify-between gap-4 rounded-md px-4 py-3 font-medium text-fg [&::-webkit-details-marker]:hidden">
        On this page
        <ChevronDown
          aria-hidden="true"
          className="size-5 shrink-0 text-fg-muted transition-transform duration-base ease-out group-open:rotate-180 motion-reduce:transition-none"
          strokeWidth={1.5}
        />
      </summary>
      <nav aria-label="On this page" className="border-t border-border px-2 py-2">
        <ol>
          {entries.map((entry) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className="flex min-h-hit items-center rounded-sm px-2 text-small text-fg-muted hover:text-fg"
              >
                {entry.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
