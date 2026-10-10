import { formatBdt, type Plan, type Rate, rateUnitLabel, type RateUnit } from '@campus/contracts';

/**
 * The Spaces page's period filter (docs/05-pages-and-interactions.md → Spaces & Pricing), in
 * display order. `adverb` finishes "Showing the plans you can book …".
 */
export const PERIODS = [
  { value: 'hourly', label: 'Hourly', adverb: 'by the hour' },
  { value: 'daily', label: 'Daily', adverb: 'by the day' },
  { value: 'weekly', label: 'Weekly', adverb: 'by the week' },
  { value: 'monthly', label: 'Monthly', adverb: 'by the month' },
] as const;

export type Period = (typeof PERIODS)[number]['value'];

/** The query parameter that carries the period: `/spaces?period=monthly`. */
export const PERIOD_PARAM = 'period';

// Block rates ("৳10,000 / 4 hours") are booked by the hour, so they count as hourly.
const UNIT_PERIOD: Record<RateUnit, Period> = {
  hour: 'hourly',
  block: 'hourly',
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
};

/** The period a rate is paid by. */
export function ratePeriod(rate: Pick<Rate, 'unit'>): Period {
  return UNIT_PERIOD[rate.unit];
}

/** The periods a plan can be paid by, in filter order. */
export function planPeriods(plan: Pick<Plan, 'rates'>): Period[] {
  const offered = new Set(plan.rates.map(ratePeriod));
  return PERIODS.map((period) => period.value).filter((period) => offered.has(period));
}

export interface PeriodPrice {
  rate: Rate;
  /** Other rates are paid by the same period (or, with none chosen, at all), so say "From". */
  isFrom: boolean;
}

/**
 * The price a plan leads with on Spaces: its lowest rate paid by `period`, or its lowest rate of
 * all with no period chosen (planFromRate's "From"). Ties keep the first listed rate. `undefined`
 * when the plan can't be booked by that period (the filter hides it then).
 */
export function periodPrice(
  plan: Pick<Plan, 'rates'>,
  period: Period | undefined,
): PeriodPrice | undefined {
  const rates = period ? plan.rates.filter((rate) => ratePeriod(rate) === period) : plan.rates;
  const [first, ...rest] = rates;
  if (!first) return undefined;
  const rate = rest.reduce((low, next) => (next.amountBdt < low.amountBdt ? next : low), first);
  return { rate, isFrom: rates.length > 1 };
}

/**
 * The plans' prices for `period`, for screen readers when the period changes: "Hot Desk, 650 taka
 * per day; …". `undefined` with no period, or when no plan can be booked by it.
 */
export function periodPriceSummary(
  plans: readonly Pick<Plan, 'name' | 'rates'>[],
  period: Period | undefined,
): string | undefined {
  if (!period) return undefined;
  const parts = plans.flatMap((plan) => {
    const price = periodPrice(plan, period);
    if (!price) return [];
    const amount = formatBdt(price.rate.amountBdt).replace('৳', '');
    return [
      `${plan.name}, ${price.isFrom ? 'from ' : ''}${amount} taka per ${rateUnitLabel(price.rate)}`,
    ];
  });
  return parts.length > 0 ? `${parts.join('; ')}.` : undefined;
}

/** `?period=` as a period, or `undefined` (show everything) when missing, repeated or unknown. */
export function parsePeriod(raw: string | string[] | null | undefined): Period | undefined {
  if (typeof raw !== 'string') return undefined;
  return PERIODS.find((period) => period.value === raw)?.value;
}

export function periodInfo(period: Period): (typeof PERIODS)[number] {
  const info = PERIODS.find((entry) => entry.value === period);
  // PERIODS lists every Period; this keeps the type honest.
  if (!info) throw new Error(`Unknown period ${period}`);
  return info;
}

/**
 * What the filter says it's showing: "Showing the 4 plans you can book by the month.", or
 * `undefined` with no period set.
 */
export function periodSummary(
  period: Period | undefined,
  matching: number,
  total: number,
): string | undefined {
  if (!period) return undefined;
  const { adverb } = periodInfo(period);
  if (matching === 0) return `Nothing can be booked ${adverb} right now.`;
  if (matching === total) return `Every plan can be booked ${adverb}.`;
  if (matching === 1) return `Showing the one plan you can book ${adverb}.`;
  return `Showing the ${String(matching)} plans you can book ${adverb}.`;
}
