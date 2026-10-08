import { describe, expect, it } from 'vitest';

import { plansSeed, type Plan } from '@campus/contracts';

import { cheapestRate } from '@/lib/plans';

describe('cheapestRate', () => {
  it('finds the lowest hourly rate across plans', () => {
    expect(cheapestRate(plansSeed, 'hour')).toMatchObject({ amountBdt: 100, unit: 'hour' });
  });

  it('only compares rates of the asked unit', () => {
    expect(cheapestRate(plansSeed, 'month')).toMatchObject({ amountBdt: 10000 });
  });

  it('keeps the first of equal rates', () => {
    const [hotDesk] = plansSeed;
    if (!hotDesk) throw new Error('seed has no plans');
    const twin: Plan = { ...hotDesk, rates: [{ id: 'twin', amountBdt: 100, unit: 'hour' }] };
    expect(cheapestRate([hotDesk, twin], 'hour')?.id).toBe('hourly');
  });

  it('is undefined when nothing is charged per that unit', () => {
    expect(cheapestRate(plansSeed.slice(1, 2), 'hour')).toBeUndefined();
    expect(cheapestRate([], 'hour')).toBeUndefined();
  });
});
