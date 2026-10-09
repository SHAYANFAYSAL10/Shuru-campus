import { type Plan } from '@campus/contracts';

import { PlanCard } from '@/components/home/plan-card';
import { SectionHeading } from '@/components/sections/section-heading';
import { Link } from '@/components/ui/link';
import { SnapCarousel } from '@/components/ui/snap-carousel';

export interface RelatedPlansProps {
  /** The plans to suggest, in display order (`relatedPlans()`). */
  plans: readonly Plan[];
}

const TITLE_ID = 'related-plans-title';

/**
 * Other plans worth a look, under a plan's own page (05 → `/spaces/[slug]`): the same cards as
 * Home → Spaces, so they lead to their own pages. A snap carousel until `lg`, where three cards
 * fit a row (three columns are too narrow for a card at `md`). Left out when there's nothing to
 * suggest.
 */
export function RelatedPlans({ plans }: RelatedPlansProps) {
  if (plans.length === 0) return null;

  return (
    <section aria-labelledby={TITLE_ID} className="bg-bg-alt">
      <div className="mx-auto max-w-content py-section px-page-safe">
        <SectionHeading
          id={TITLE_ID}
          eyebrow="More spaces"
          title={
            <>
              Need a different <em>size</em>?
            </>
          }
          lead="The plans a size down and a size up from this one."
        />

        <SnapCarousel
          label="Other plans"
          itemName="plan"
          className="mt-10 lg:mt-14"
          // As on Home → Spaces (see PlanCard): one column per card while it scrolls, so cards
          // share rows, and card rows spaced by the cards' bottom margin, not a row gap.
          listClassName="grid grid-flow-col auto-cols-[80%] max-lg:bleed-page-x sm:auto-cols-[45%] lg:grid-flow-row lg:grid-cols-3 gap-y-0 lg:gap-x-gutter lg:overflow-visible"
          buttonsClassName="lg:hidden"
          controlsClassName="lg:mt-0"
          aside={
            <Link href="/spaces" variant="standalone" className="min-h-hit">
              Compare all plans
            </Link>
          }
        >
          {plans.map((plan) => (
            <PlanCard key={plan.slug} plan={plan} as="li" className="lg:mb-12" />
          ))}
        </SnapCarousel>
      </div>
    </section>
  );
}
