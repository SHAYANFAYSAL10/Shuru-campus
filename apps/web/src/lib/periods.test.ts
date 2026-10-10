import { describe, expect, it } from 'vitest';

import { plansSeed, type Plan } from '@campus/contracts';

import {
  parsePeriod,
  periodPrice,
  periodPriceSummary,
  periodSummary,
  planPeriods,
  ratePeriod,
} from '@/lib/periods';

function seedPlan(slug: Plan['slug']): Plan {
  const plan = plansSeed.find((p) => p.slug === slug);
  if (!plan) throw new Error(`seed has no ${slug}`);
  return plan;
}

describe('ratePeriod', () => {
  it('maps each unit to the period it is paid by', () => {
    expect(ratePeriod({ unit: 'hour' })).toBe('hourly');
    expect(ratePeriod({ unit: 'day' })).toBe('daily');
    expect(ratePeriod({ unit: 'week' })).toBe('weekly');
    expect(ratePeriod({ unit: 'month' })).toBe('monthly');
  });

  it('counts block rates as hourly', () => {
    expect(ratePeriod({ unit: 'block' })).toBe('hourly');
  });
});

describe('planPeriods', () => {
  it('lists each period once, in filter order', () => {
    expect(planPeriods(seedPlan('hot-desk'))).toEqual(['hourly', 'daily']);
    expect(planPeriods(seedPlan('executive-seating'))).toEqual(['weekly', 'monthly']);
    expect(planPeriods(seedPlan('seminar-room'))).toEqual(['hourly']);
  });

  it('sorts by period, not by the order rates are listed', () => {
    const plan = {
      rates: [
        { id: 'm', amountBdt: 1, unit: 'month' },
        { id: 'h', amountBdt: 1, unit: 'hour' },
      ],
    } satisfies Pick<Plan, 'rates'>;
    expect(planPeriods(plan)).toEqual(['hourly', 'monthly']);
  });
});

describe('parsePeriod', () => {
  it('accepts the four periods', () => {
    expect(parsePeriod('hourly')).toBe('hourly');
    expect(parsePeriod('monthly')).toBe('monthly');
  });

  it('ignores missing, repeated and unknown values', () => {
    expect(parsePeriod(undefined)).toBeUndefined();
    expect(parsePeriod(null)).toBeUndefined();
    expect(parsePeriod('')).toBeUndefined();
    expect(parsePeriod('Monthly')).toBeUndefined();
    expect(parsePeriod('yearly')).toBeUndefined();
    expect(parsePeriod(['monthly', 'weekly'])).toBeUndefined();
  });
});

describe('periodPrice', () => {
  it('leads with the only rate paid by the period', () => {
    const price = periodPrice(seedPlan('hot-desk'), 'daily');
    expect(price?.rate.id).toBe('daily');
    expect(price?.isFrom).toBe(false);
  });

  it('leads with the lowest of several rates, as "From"', () => {
    const price = periodPrice(seedPlan('executive-seating'), 'monthly');
    expect(price?.rate.amountBdt).toBe(14000);
    expect(price?.isFrom).toBe(true);
  });

  it('counts block rates as hourly', () => {
    const price = periodPrice(seedPlan('seminar-room'), 'hourly');
    expect(price?.rate.amountBdt).toBe(3000);
    expect(price?.rate.id).toBe('up-to-14');
  });

  it('falls back to the lowest rate of all with no period', () => {
    const price = periodPrice(seedPlan('hot-desk'), undefined);
    expect(price?.rate.id).toBe('hourly');
    expect(price?.isFrom).toBe(true);
  });

  it('has nothing for a period the plan is not booked by', () => {
    expect(periodPrice(seedPlan('hot-desk'), 'monthly')).toBeUndefined();
  });
});

describe('periodPriceSummary', () => {
  const plans = ['hot-desk', 'business-seating', 'executive-seating'].map((slug) =>
    seedPlan(slug as Plan['slug']),
  );

  it('reads out each bookable plan with its price', () => {
    expect(periodPriceSummary(plans, 'monthly')).toBe(
      'Business Seating, 10,000 taka per month; Executive Seating, from 14,000 taka per month.',
    );
    expect(periodPriceSummary(plans, 'daily')).toBe('Hot Desk, 650 taka per day.');
  });

  it('says nothing without a period or a bookable plan', () => {
    expect(periodPriceSummary(plans, undefined)).toBeUndefined();
    expect(periodPriceSummary([seedPlan('hot-desk')], 'weekly')).toBeUndefined();
  });
});

describe('periodSummary', () => {
  it('says nothing without a period', () => {
    expect(periodSummary(undefined, 6, 6)).toBeUndefined();
  });

  it('counts the plans shown', () => {
    expect(periodSummary('monthly', 3, 6)).toBe('Showing the 3 plans you can book by the month.');
    expect(periodSummary('daily', 1, 6)).toBe('Showing the one plan you can book by the day.');
  });

  it('covers every plan and none', () => {
    expect(periodSummary('hourly', 6, 6)).toBe('Every plan can be booked by the hour.');
    expect(periodSummary('weekly', 0, 6)).toBe('Nothing can be booked by the week right now.');
  });
});
