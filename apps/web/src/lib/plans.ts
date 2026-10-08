import { type Plan, type Rate, type RateUnit } from '@campus/contracts';

/**
 * The cheapest rate charged per `unit` across all plans: the hero's "From ৳100/hr". `undefined`
 * when no plan charges per that unit, so callers leave the claim out rather than invent one.
 */
export function cheapestRate(plans: readonly Plan[], unit: RateUnit): Rate | undefined {
  let cheapest: Rate | undefined;
  for (const rate of plans.flatMap((plan) => plan.rates)) {
    if (rate.unit === unit && (!cheapest || rate.amountBdt < cheapest.amountBdt)) cheapest = rate;
  }
  return cheapest;
}

/**
 * A plan's entry price: its lowest rate, for "From ৳100/hour" on plan cards. Ties keep the first
 * listed rate, so the plan's own order decides.
 */
export function planFromRate(plan: Plan): Rate {
  const [first, ...rest] = plan.rates;
  // The contract requires at least one rate; this keeps the type honest.
  if (!first) throw new Error(`Plan ${plan.slug} has no rates.`);
  return rest.reduce((low, rate) => (rate.amountBdt < low.amountBdt ? rate : low), first);
}

/** How many features a plan card lists (05 → Home #3: "3 key features"). */
export const CARD_FEATURE_COUNT = 3;

/** The features a plan card lists: the first few, in the plan's own order. */
export function keyFeatures(plan: Plan, count = CARD_FEATURE_COUNT): Plan['features'] {
  return plan.features.slice(0, count);
}

/** Plans in their display order (`order`, then name), without changing the input. */
export function sortPlans(plans: readonly Plan[]): Plan[] {
  return [...plans].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

/** A plan's own page (05 → `/spaces/[slug]`). */
export function planHref(slug: Plan['slug']): string {
  return `/spaces/${slug}`;
}
