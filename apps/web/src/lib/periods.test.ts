import { describe, expect, it } from 'vitest';

import { plansSeed, type Plan } from '@campus/contracts';

import { parsePeriod, periodSummary, planPeriods, ratePeriod } from '@/lib/periods';

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
