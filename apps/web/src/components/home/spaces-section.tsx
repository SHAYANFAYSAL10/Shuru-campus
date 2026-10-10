import { type Plan } from '@campus/contracts';

import { PlanCard } from '@/components/home/plan-card';
import { PlansNotice } from '@/components/sections/plans-notice';
import { SectionHeading } from '@/components/sections/section-heading';
import { Link } from '@/components/ui/link';
import { SnapCarousel } from '@/components/ui/snap-carousel';
import { sortPlans } from '@/lib/plans';

export interface SpacesSectionProps {
  /** `null` when plans couldn't be loaded. */
  plans: readonly Plan[] | null;
  /** Position on Home, for the eyebrow. */
  number?: number;
}

const TITLE_ID = 'spaces-title';

/**
 * Home #3 (docs/05-pages-and-interactions.md): every plan as a card. Below `md` the cards are a
 * snap carousel with previous/next buttons; from `md` they're a grid (2, then 3 columns). If plans
 * can't be loaded the section says so and points to a person instead of showing stale prices.
 */
export function SpacesSection({ plans, number }: SpacesSectionProps) {
  const sorted = plans ? sortPlans(plans) : [];

  return (
    <section aria-labelledby={TITLE_ID} className="mx-auto max-w-content py-section px-page-safe">
      <SectionHeading
        id={TITLE_ID}
        number={number}
        eyebrow="Spaces"
        title={
          <>
            A space for every <em>stage</em>.
          </>
        }
        lead="From an hour at a hot desk to a private office for your team."
      />

      {sorted.length > 0 ? (
        <SnapCarousel
          label="Plans"
          itemName="plan"
          className="mt-10 lg:mt-14"
          // A grid in both layouts, so cards can share rows (see PlanCard): one column per card
          // below `md` (80%, 45% from `sm`: the next card peeks in, so the row reads as
          // scrollable), then 2 and 3 columns that wrap. Card rows are spaced by the cards' bottom
          // margin, not a row gap: Chromium adds the list's row gap into the subgrid's rows. While
          // it scrolls, 4px of top padding leave room for a card's hover lift (a mouse at 200% zoom).
          listClassName="grid grid-flow-col auto-cols-[80%] max-md:bleed-page-x max-md:pt-1 sm:auto-cols-[45%] md:grid-flow-row md:grid-cols-2 gap-y-0 md:gap-x-gutter md:overflow-visible lg:grid-cols-3"
          buttonsClassName="md:hidden"
          controlsClassName="md:mt-0"
          aside={
            <Link href="/spaces" variant="standalone" className="min-h-hit">
              Compare all plans
            </Link>
          }
        >
          {sorted.map((plan) => (
            <PlanCard key={plan.slug} plan={plan} as="li" className="md:mb-12" />
          ))}
        </SnapCarousel>
      ) : (
        <PlansNotice reason={plans ? 'empty' : 'error'} className="mt-10 lg:mt-14" />
      )}
    </section>
  );
}
