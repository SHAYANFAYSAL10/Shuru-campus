import { type ReactNode } from 'react';

export interface SgSectionProps {
  id: string;
  number: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}

/** A numbered styleguide section ("01 — Color"), following the Home eyebrow pattern (B2). */
export function SgSection({ id, number, title, intro, children }: SgSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-8 py-16 first:pt-0">
      <p className="type-eyebrow text-fg-subtle">
        {number} — {title}
      </p>
      <h2 id={`${id}-title`} className="mt-3 type-h2 text-fg">
        {title}
      </h2>
      {intro ? <p className="mt-4 max-w-prose text-body text-fg-muted">{intro}</p> : null}
      <div className="mt-10 flex flex-col gap-12">{children}</div>
    </section>
  );
}

/** A labelled group inside a section. */
export function SgGroup({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-body font-medium text-fg">{title}</h3>
        {note ? <p className="mt-1 max-w-prose text-small text-fg-muted">{note}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** A component with a caption naming its state. */
export function SgState({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2">
      {children}
      <span className="type-eyebrow text-fg-subtle">{label}</span>
    </div>
  );
}
