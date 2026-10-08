import { describe, expect, it } from 'vitest';

import { plansSeed, type Plan } from '@campus/contracts';

import { cheapestRate, keyFeatures, planFromRate, planHref, sortPlans } from '@/lib/plans';

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

describe('planFromRate', () => {
  const plan = (slug: Plan['slug']) => {
    const found = plansSeed.find((p) => p.slug === slug);
    if (!found) throw new Error(`seed has no ${slug}`);
    return found;
  };

  it("is the plan's lowest rate, whatever its unit", () => {
    expect(planFromRate(plan('hot-desk'))).toMatchObject({ amountBdt: 100, unit: 'hour' });
    expect(planFromRate(plan('executive-seating'))).toMatchObject({
      amountBdt: 4000,
      unit: 'week',
    });
    expect(planFromRate(plan('meeting-room'))).toMatchObject({ id: 'mini', amountBdt: 300 });
  });

  it('keeps the first of equal rates', () => {
    expect(planFromRate(plan('seminar-room')).id).toBe('up-to-14');
  });
});

describe('keyFeatures', () => {
  it("lists the plan's first three features", () => {
    const [hotDesk] = plansSeed;
    if (!hotDesk) throw new Error('seed has no plans');
    expect(keyFeatures(hotDesk).map((f) => f.title)).toEqual([
      'Designated hot-desk seating',
      'Silent Room & Timeout Zone access',
      'Up to 40 Mbps internet',
    ]);
  });
});

describe('sortPlans', () => {
  it('orders by `order` without touching the input', () => {
    const reversed = [...plansSeed].reverse();
    expect(sortPlans(reversed).map((p) => p.slug)).toEqual(plansSeed.map((p) => p.slug));
    expect(reversed[0]?.slug).toBe('seminar-room');
  });
});

describe('planHref', () => {
  it("is the plan's own page", () => {
    expect(planHref('hot-desk')).toBe('/spaces/hot-desk');
  });
});
