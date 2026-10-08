import { type Rate, type RateUnit } from '../schemas/plan';

// Grouping is pinned to thousands (৳10,000 / ৳100,000), which is what Node's ICU produces for
// `en-BD`. Browsers ship different ICU data, so a locale-driven formatter could render
// differently on the server and the client and cause hydration mismatches.
const grouping = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0, useGrouping: true });

/** `10000` → `৳10,000`. Amounts are whole taka. */
export function formatBdt(amount: number): string {
  if (!Number.isInteger(amount)) {
    throw new RangeError(`formatBdt expects whole taka, got ${String(amount)}`);
  }
  const sign = amount < 0 ? '−' : '';
  return `${sign}৳${grouping.format(Math.abs(amount))}`;
}

const LONG_UNITS: Record<Exclude<RateUnit, 'block'>, string> = {
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
};

const SHORT_UNITS: Record<Exclude<RateUnit, 'block'>, string> = {
  hour: 'hr',
  day: 'day',
  week: 'wk',
  month: 'mo',
};

export type RateLabelStyle = 'long' | 'short';

/** The unit a rate is charged per: `hour`, `month`, `4 hours` (block). */
export function rateUnitLabel(
  rate: Pick<Rate, 'unit' | 'blockHours'>,
  style: RateLabelStyle = 'long',
): string {
  if (rate.unit === 'block') {
    const hours = rate.blockHours ?? 1;
    const word = style === 'short' ? 'hr' : 'hour';
    return `${String(hours)} ${word}${hours === 1 ? '' : 's'}`;
  }
  return (style === 'short' ? SHORT_UNITS : LONG_UNITS)[rate.unit];
}

/**
 * Price with its unit.
 * - long: `৳10,000 / month`, `৳10,000 / 4 hours`
 * - short: `৳100/hr`, `৳10,000/4 hrs`
 */
export function rateLabel(
  rate: Pick<Rate, 'amountBdt' | 'unit' | 'blockHours'>,
  style: RateLabelStyle = 'long',
): string {
  const separator = style === 'short' ? '/' : ' / ';
  return `${formatBdt(rate.amountBdt)}${separator}${rateUnitLabel(rate, style)}`;
}
