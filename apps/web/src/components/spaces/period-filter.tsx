'use client';

import { usePeriod } from '@/components/spaces/period-scope';
import { buttonClasses } from '@/components/ui/button-classes';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { PERIOD_PARAM, PERIODS } from '@/lib/periods';

export interface PeriodFilterProps {
  /** Where the form goes without JS: this page, scrolled to the plans. */
  action: string;
  className?: string;
}

/**
 * "How would you like to pay?": Hourly · Daily · Weekly · Monthly (05 → Spaces & Pricing). A
 * segmented control inside a GET form: with JS a choice applies at once; without it, "Show
 * plans" submits `?period=` and the server renders the filtered page. Nothing is chosen until the
 * visitor picks a period; `<PeriodSummary>` offers the way back to every plan.
 */
export function PeriodFilter({ action, className }: PeriodFilterProps) {
  const { period, setPeriod } = usePeriod();

  return (
    <form
      method="get"
      action={action}
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="flex flex-wrap items-end gap-3">
        <SegmentedControl
          legend="How would you like to pay?"
          name={PERIOD_PARAM}
          size="sm"
          options={PERIODS}
          value={period}
          onValueChange={setPeriod}
        />
        <noscript>
          <button type="submit" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            Show plans
          </button>
        </noscript>
      </div>
    </form>
  );
}
