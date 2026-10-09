import { PlansNotice } from '@/components/sections/plans-notice';
import { ComparisonSection } from '@/components/spaces/comparison-section';
import { FaqSection } from '@/components/spaces/faq-section';
import { PeriodFilter } from '@/components/spaces/period-filter';
import { PeriodScope } from '@/components/spaces/period-scope';
import { PeriodSummary } from '@/components/spaces/period-summary';
import { PlanJumpNav } from '@/components/spaces/plan-jump-nav';
import { PlanSection } from '@/components/spaces/plan-section';
import { getBrand, getPlans, getSiteSettings } from '@/lib/api';
import { spacesFaq } from '@/lib/faq';
import { listText } from '@/lib/list-text';
import { pageMetadata } from '@/lib/metadata';
import { parsePeriod, PERIOD_PARAM, PERIODS, planPeriods, type Period } from '@/lib/periods';
import { sortPlans } from '@/lib/plans';

import type { Metadata } from 'next';

const PATH = '/spaces';
const TITLE_ID = 'spaces-title';
/** Where the period form lands without JS: the filter, with the plans right below. */
const PRICING_ID = 'pricing';

export async function generateMetadata(): Promise<Metadata> {
  const [brand, plans] = await Promise.all([getBrand(), getPlans()]);
  const names = plans.ok ? sortPlans(plans.data).map((plan) => plan.name) : [];
  return pageMetadata(brand, {
    title: 'Spaces & pricing',
    description:
      names.length > 0
        ? `Plans and prices in taka for ${listText(names)}, in the heart of Gulshan. Book by the hour, day, week or month.`
        : 'Plans and prices in taka for co-working in the heart of Gulshan.',
    path: PATH,
  });
}

/**
 * Spaces & Pricing (docs/05-pages-and-interactions.md): the intro with the period filter, every
 * plan in full, the comparison and the FAQ. The page reads `?period=` on the server, so a shared
 * or no-JS filtered link arrives already filtered; after that the filter runs in the browser.
 */
export default async function SpacesPage({ searchParams }: PageProps<'/spaces'>) {
  const [site, plans, query] = await Promise.all([getSiteSettings(), getPlans(), searchParams]);
  const period = parsePeriod(query[PERIOD_PARAM]);
  const sorted = plans.ok ? sortPlans(plans.data) : [];

  const counts = Object.fromEntries(
    PERIODS.map(({ value }) => [
      value,
      sorted.filter((plan) => planPeriods(plan).includes(value)).length,
    ]),
  ) as Record<Period, number>;

  return (
    <>
      <PeriodScope initialPeriod={period} key={period ?? 'all'}>
        <section aria-labelledby={TITLE_ID}>
          <div className="mx-auto max-w-content pt-12 px-page-safe sm:pt-16 lg:pt-24">
            <p className="type-eyebrow text-fg-subtle">Spaces & pricing</p>
            {/* 20ch: the display measure (B1). */}
            <h1 id={TITLE_ID} className="mt-4 max-w-[20ch] type-h1 text-balance text-fg">
              Pay for the space you <em>use</em>.
            </h1>
            <p className="mt-6 max-w-2xl type-lead text-pretty text-fg-muted">
              Hot desks by the hour, your own seat by the week or month, offices for your team and
              rooms for the meetings in between. Prices are in taka.
            </p>

            {sorted.length > 0 ? (
              <div id={PRICING_ID} className="mt-10 flex flex-col gap-8 lg:mt-14">
                <PeriodFilter action={`${PATH}#${PRICING_ID}`} />
                <div className="flex flex-col gap-4">
                  <PlanJumpNav plans={sorted} />
                  {/* Right above the plans it describes; it holds its line even when empty. */}
                  <PeriodSummary counts={counts} total={sorted.length} resetHref={PATH} />
                </div>
              </div>
            ) : (
              <PlansNotice reason={plans.ok ? 'empty' : 'error'} className="mt-10 lg:mt-14" />
            )}
          </div>
        </section>

        {sorted.length > 0 ? (
          <div className="mx-auto max-w-content pt-6 px-page-safe pb-section lg:pt-10">
            {sorted.map((plan, index) => (
              <PlanSection key={plan.slug} plan={plan} index={index} eager={index === 0} />
            ))}
          </div>
        ) : null}
      </PeriodScope>

      {sorted.length > 0 ? <ComparisonSection plans={sorted} /> : null}
      <FaqSection items={spacesFaq({ hours: site.hours, plans: sorted })} />
    </>
  );
}
