import { Plus } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface AccordionItemProps {
  /** Items sharing a `group` open one at a time (native exclusive `<details name>`). */
  group?: string;
  /** Anchor id, so a question can be linked to. */
  id?: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * One question of an accordion (the Spaces FAQ). A native `<details>`: it opens and closes
 * without JS, by keyboard (Enter/Space on the summary) and with find-in-page, and screen readers
 * announce it as expanded or collapsed. The plus turns into a cross and the answer rises in
 * (transform and opacity only); under reduced motion the answer only fades.
 */
export function AccordionItem({ group, id, title, children, className }: AccordionItemProps) {
  return (
    <details name={group} id={id} className={cn('group border-b border-border', className)}>
      <summary className="flex min-h-hit cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-5 text-start text-fg transition-colors hover:text-accent-text [&::-webkit-details-marker]:hidden">
        <span className="text-lead font-medium text-pretty">{title}</span>
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-border-strong text-fg transition-transform duration-base ease-out group-open:rotate-45 motion-reduce:transition-none"
        >
          <Plus className="size-5" strokeWidth={1.5} />
        </span>
      </summary>
      <div className="max-w-prose pb-6 text-fg-muted group-open:animate-reveal motion-reduce:group-open:animate-fade-in">
        {children}
      </div>
    </details>
  );
}

export interface AccordionProps {
  children: ReactNode;
  className?: string;
}

/** A list of `AccordionItem`s with a rule above the first. */
export function Accordion({ children, className }: AccordionProps) {
  return <div className={cn('border-t border-border', className)}>{children}</div>;
}
