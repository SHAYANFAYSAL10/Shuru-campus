import { type Brand, type OpeningHours } from '@campus/contracts';

import { DayTimeline } from '@/components/home/day-timeline';
import { SectionHeading } from '@/components/sections/section-heading';

export interface DaySectionProps {
  shortName: Brand['shortName'];
  hours: OpeningHours;
  /** Position on Home, for the eyebrow. */
  number?: number;
}

const TITLE_ID = 'day-title';

/**
 * Home #6 (docs/05-pages-and-interactions.md): "A day at {shortName}", the page's one lake band
 * (10 → A5). The moments of a working day on a rail the begin line follows to the current Dhaka
 * time (`<DayTimeline>`). In dark mode a hairline sets the band off the page (10 → A3).
 */
export function DaySection({ shortName, hours, number }: DaySectionProps) {
  return (
    <section aria-labelledby={TITLE_ID} className="surface-brand dark:border-y dark:border-border">
      <div className="mx-auto max-w-content py-section px-page-safe">
        <SectionHeading
          id={TITLE_ID}
          number={number}
          eyebrow={`A day at ${shortName}`}
          inverse
          title={
            <>
              How a day here <em>unfolds</em>.
            </>
          }
          lead="While we’re open, the line follows the clock in Dhaka, so you can see where today is up to."
        />
        <DayTimeline hours={hours} className="mt-10 lg:mt-14" />
      </div>
    </section>
  );
}
