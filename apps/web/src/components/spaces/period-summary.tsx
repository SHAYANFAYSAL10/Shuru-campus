'use client';

import { usePeriod } from '@/components/spaces/period-scope';
import { type Period, periodSummary } from '@/lib/periods';

export interface PeriodSummaryProps {
  /** How many plans offer each period. */
  counts: Readonly<Record<Period, number>>;
  total: number;
  /** The unfiltered page, for "Show all plans" without JS. */
  resetHref: string;
}

/**
 * What the period filter is showing, announced politely as it changes ("Showing the 3 plans you
 * can book by the month."), with the way back to every plan. Empty, but present, with no period,
 * so the live region exists before the first change.
 */
export function PeriodSummary({ counts, total, resetHref }: PeriodSummaryProps) {
  const { period, setPeriod } = usePeriod();
  const summary = periodSummary(period, period ? counts[period] : total, total);

  return (
    <div className="flex min-h-hit flex-wrap items-center gap-x-4 text-small text-fg-muted">
      <p aria-live="polite">{summary}</p>
      {period ? (
        <a
          href={resetHref}
          onClick={(event) => {
            event.preventDefault();
            // The link goes away with the filter, so hand focus to the period choices.
            const scope = event.currentTarget.closest('[data-period-scope]');
            setPeriod(undefined);
            scope?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus();
          }}
          className="inline-flex min-h-hit items-center rounded-sm font-medium text-accent-text underline decoration-1 underline-offset-3 hover:decoration-2"
        >
          Show all plans
        </a>
      ) : null}
    </div>
  );
}
