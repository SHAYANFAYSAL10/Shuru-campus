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
