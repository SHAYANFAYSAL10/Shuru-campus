import { describe, expect, it } from 'vitest';

import { Plan, PlanList, Rate } from './plan';

const plan = {
  slug: 'hot-desk',
  name: 'Hot Desk',
  summary: 'Drop in and work.',
  audience: ['Freelancers'],
  rates: [{ id: 'hour', amountBdt: 100, unit: 'hour' }],
  features: [{ title: 'Unlimited tea & coffee' }],
  imageId: 'hot-desk',
  highlight: false,
  order: 0,
};

describe('Rate', () => {
  it.each([
    [100, true],
    [1, true],
    [0, false],
    [-5, false],
    [99.5, false],
  ])('amount %s → valid: %s', (amountBdt, ok) => {
    expect(Rate.safeParse({ id: 'r', amountBdt, unit: 'hour' }).success).toBe(ok);
  });

  it('requires block hours for block rates only', () => {
    expect(Rate.safeParse({ id: 'r', amountBdt: 10000, unit: 'block' }).success).toBe(false);
    expect(
      Rate.safeParse({ id: 'r', amountBdt: 10000, unit: 'block', blockHours: 4 }).success,
    ).toBe(true);
    expect(Rate.safeParse({ id: 'r', amountBdt: 100, unit: 'hour', blockHours: 4 }).success).toBe(
      false,
    );
  });

  it('rejects unknown units and non-kebab ids', () => {
    expect(Rate.safeParse({ id: 'r', amountBdt: 100, unit: 'year' }).success).toBe(false);
    expect(Rate.safeParse({ id: 'Per Hour', amountBdt: 100, unit: 'hour' }).success).toBe(false);
  });
});

describe('Plan', () => {
  it('accepts a valid plan', () => {
    expect(Plan.safeParse(plan).success).toBe(true);
  });

  it('needs at least one rate and one audience', () => {
    expect(Plan.safeParse({ ...plan, rates: [] }).success).toBe(false);
    expect(Plan.safeParse({ ...plan, audience: [] }).success).toBe(false);
  });

  it('rejects duplicate rate ids', () => {
    const rates = [plan.rates[0], plan.rates[0]];
    expect(Plan.safeParse({ ...plan, rates }).success).toBe(false);
  });

  it('rejects unknown slugs', () => {
    expect(Plan.safeParse({ ...plan, slug: 'penthouse' }).success).toBe(false);
  });
});

describe('PlanList', () => {
  it('rejects duplicate slugs', () => {
    expect(PlanList.safeParse([plan, { ...plan, order: 1 }]).success).toBe(false);
    expect(PlanList.safeParse([plan, { ...plan, slug: 'meeting-room' }]).success).toBe(true);
  });
});
