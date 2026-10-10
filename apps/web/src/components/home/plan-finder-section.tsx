import dynamic from 'next/dynamic';

import { type Plan } from '@campus/contracts';

import { SectionHeading } from '@/components/sections/section-heading';

// Code-split (CLAUDE.md → Performance budgets): the finder's JS is its own chunk, outside the
// route's first load. It still renders on the server, so the questions arrive in the HTML.
const PlanFinder = dynamic(() =>
  import('@/components/home/plan-finder').then((mod) => mod.PlanFinder),
);

export interface PlanFinderSectionProps {
  /** Loaded plans; Home leaves the section out when there are none. */
  plans: readonly Plan[];
  /** Position on Home, for the eyebrow. */
  number?: number;
}

const TITLE_ID = 'plan-finder-title';

/** Home #4 (docs/05-pages-and-interactions.md): three questions that suggest a plan. */
export function PlanFinderSection({ plans, number }: PlanFinderSectionProps) {
  return (
    <section
      id="plan-finder"
      aria-labelledby={TITLE_ID}
      className="mx-auto max-w-content py-section px-page-safe"
    >
      <SectionHeading
        id={TITLE_ID}
        number={number}
        eyebrow="Plan finder"
        title={
          <>
            Not sure which <em>one</em>?
          </>
        }
        lead="Three quick questions and we’ll point you to the plan that fits how you work."
      />
      <PlanFinder plans={plans} className="mt-10 lg:mt-14" />
    </section>
  );
}
