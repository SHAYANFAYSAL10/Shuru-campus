import { type ReactNode } from 'react';

export interface SectionHeadingProps {
  /** The `h2`'s id, for the section's `aria-labelledby`. */
  id: string;
  /** "Spaces" in "01 — Spaces". */
  eyebrow: string;
  /** Position on the page; Home numbers its sections (B2). The number is visual only. */
  number?: number;
  /** The headline, with at most one `<em>` (B2). */
  title: ReactNode;
  /** One supporting paragraph, three lines at most on desktop (B1). */
  lead?: ReactNode;
  className?: string;
}

/** Eyebrow, headline and lead for a page section (B1, B2). */
export function SectionHeading({
  id,
  eyebrow,
  number,
  title,
  lead,
  className,
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <p className="type-eyebrow text-fg-subtle">
        {number === undefined ? null : (
          <span aria-hidden="true" className="tabular-nums">
            {String(number).padStart(2, '0')} —{' '}
          </span>
        )}
        {eyebrow}
      </p>
      {/* 20ch: the display measure (B1). */}
      <h2 id={id} className="mt-4 max-w-[20ch] type-h2 text-fg">
        {title}
      </h2>
      {lead ? <p className="mt-4 max-w-xl type-lead text-fg-muted">{lead}</p> : null}
    </div>
  );
}
