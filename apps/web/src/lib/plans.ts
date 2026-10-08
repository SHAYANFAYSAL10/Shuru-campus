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

/** Where a plan's "Book this" leads: the inquiry form, pre-filled with the plan and rate. */
export function bookHref(slug: Plan['slug'], rateId?: Rate['id']): string {
  const query = new URLSearchParams({ plan: slug });
  if (rateId) query.set('rate', rateId);
  return `/contact?${query.toString()}`;
}

const RATE_TITLES: Record<Exclude<RateUnit, 'block'>, string> = {
  hour: 'Hourly',
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
};

export interface RateTitle {
  /** "Big", "Premium", or the period when the rate has no label ("Monthly"). */
  title: string;
  /** "10 people", unless the title already says how many ("3 people"). */
  note?: string;
}

/** How a rate is named in a plan's rate list. */
export function rateTitle(
  rate: Pick<Rate, 'label' | 'unit' | 'blockHours' | 'capacity'>,
): RateTitle {
  const title =
    rate.label ??
    (rate.unit === 'block' ? `${String(rate.blockHours ?? 1)}-hour block` : RATE_TITLES[rate.unit]);
  const { capacity } = rate;
  if (capacity === undefined || title.includes(String(capacity))) return { title };
  return { title, note: `${String(capacity)} ${capacity === 1 ? 'person' : 'people'}` };
}

/**
 * Plans priced by team or room size (every rate has a capacity), where other sizes are worth
 * asking about (docs/09-roadmap.md #6: "Other sizes: contact us").
 */
export function pricedBySize(plan: Pick<Plan, 'rates'>): boolean {
  return plan.rates.every((rate) => rate.capacity !== undefined);
}
