import { type Plan } from '@campus/contracts';

import { planPeriods } from '@/lib/periods';

export interface PlanJumpNavProps {
  /** In display order. */
  plans: readonly Plan[];
  className?: string;
}

/**
 * Links to each plan's section on the page. Plain anchors, so they work without JS and the
 * header's scroll padding keeps the target clear of it. A plan's link hides with the plan when
 * the period filter leaves it out.
 */
export function PlanJumpNav({ plans, className }: PlanJumpNavProps) {
  return (
    <nav aria-label="Plans on this page" className={className}>
      <ul className="flex flex-wrap gap-2">
        {plans.map((plan) => (
          <li key={plan.slug} data-offers={planPeriods(plan).join(' ')}>
            <a
              href={`#${plan.slug}`}
              className="hit-target inline-flex h-9 items-center rounded-full border border-border-strong px-4 text-small font-medium whitespace-nowrap text-fg transition-colors duration-fast ease-out hover:bg-bg-alt"
            >
              {plan.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
