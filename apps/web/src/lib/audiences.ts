import { type Plan, type PlanSlug, type Rate } from '@campus/contracts';

import { planFromRate, planHref } from '@/lib/plans';

/**
 * Who the space is for (docs/01-product-brief.md → Audiences), each with the plan that answers
 * what they need first. Facts in `need` come from the seed plans (docs/02-content.md).
 */
export interface Audience {
  id: 'independents' | 'founders' | 'teams' | 'events';
  title: string;
  need: string;
  planSlug: PlanSlug;
}

export const AUDIENCES: readonly Audience[] = [
  {
    id: 'independents',
    title: 'Freelancers & travelling professionals',
    need: 'A desk by the hour or the day, whenever you’re in town.',
    planSlug: 'hot-desk',
  },
  {
    id: 'founders',
    title: 'Entrepreneurs & business owners',
    need: 'A seat of your own by the week or the month, with a locker and meeting room time.',
    planSlug: 'business-seating',
  },
  {
    id: 'teams',
    title: 'Start-ups & small teams',
    need: 'A private office for a team of up to six, with front desk service.',
    planSlug: 'private-office',
  },
  {
    id: 'events',
    title: 'Event organizers & trainers',
    need: 'A room for seminars, workshops and training, for up to 30 people.',
    planSlug: 'seminar-room',
  },
];

export interface AudienceTile extends Audience {
  /** Where the tile leads: the plan, or every plan when it isn't available. */
  href: string;
  /** The link's text (B5: "See Hot Desk pricing"). */
  cta: string;
  /** The plan's lowest rate, when the plan loaded. */
  from?: Rate;
}

const ALL_PLANS = { href: '/spaces', cta: 'See spaces & pricing' } as const;

/**
 * The About audience tiles. Each links to its plan with that plan's "from" price; if the plan
 * isn't in `plans` (they failed to load, or it was removed), the tile points to Spaces instead,
 * so it never promises a price or a page it can't show.
 */
export function audienceTiles(plans: readonly Plan[] | null): AudienceTile[] {
  return AUDIENCES.map((audience) => {
    const plan = plans?.find((p) => p.slug === audience.planSlug);
    if (!plan) return { ...audience, ...ALL_PLANS };
    return {
      ...audience,
      href: planHref(plan.slug),
      cta: `See ${plan.name} pricing`,
      from: planFromRate(plan),
    };
  });
}
