import { describe, expect, it } from 'vitest';

import { formatBdt, rateLabel, rateUnitLabel } from './money';

describe('formatBdt', () => {
  it.each([
    [0, '৳0'],
    [100, '৳100'],
    [650, '৳650'],
    [10000, '৳10,000'],
    [100000, '৳100,000'],
    [1234567, '৳1,234,567'],
    [-2000, '−৳2,000'],
  ])('%i → %s', (amount, expected) => {
    expect(formatBdt(amount)).toBe(expected);
  });

  it('refuses fractional taka', () => {
    expect(() => formatBdt(99.5)).toThrow(RangeError);
  });
});

describe('rateLabel', () => {
  it.each([
    [{ amountBdt: 100, unit: 'hour' }, '৳100 / hour', '৳100/hr'],
    [{ amountBdt: 650, unit: 'day' }, '৳650 / day', '৳650/day'],
    [{ amountBdt: 2800, unit: 'week' }, '৳2,800 / week', '৳2,800/wk'],
    [{ amountBdt: 10000, unit: 'month' }, '৳10,000 / month', '৳10,000/mo'],
    [{ amountBdt: 10000, unit: 'block', blockHours: 4 }, '৳10,000 / 4 hours', '৳10,000/4 hrs'],
    [{ amountBdt: 500, unit: 'block', blockHours: 1 }, '৳500 / 1 hour', '৳500/1 hr'],
  ] as const)('%o → "%s" / "%s"', (rate, long, short) => {
    expect(rateLabel(rate)).toBe(long);
    expect(rateLabel(rate, 'short')).toBe(short);
  });

  it('defaults a block without hours to one hour', () => {
    expect(rateUnitLabel({ unit: 'block' })).toBe('1 hour');
  });
});
