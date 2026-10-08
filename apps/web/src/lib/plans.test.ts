import { describe, expect, it } from 'vitest';

import { plansSeed, type Plan } from '@campus/contracts';

import {
  bookHref,
  cheapestRate,
  keyFeatures,
  planFromRate,
  planHref,
  pricedBySize,
  rateTitle,
  planDescription,
  relatedPlans,
  sortPlans,
} from '@/lib/plans';

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

describe('bookHref', () => {
  it('carries the plan, and the rate when one is chosen', () => {
    expect(bookHref('meeting-room', 'big')).toBe('/contact?plan=meeting-room&rate=big');
    expect(bookHref('hot-desk')).toBe('/contact?plan=hot-desk');
  });
});

describe('rateTitle', () => {
  it('uses the label, or the period when there is none', () => {
    expect(rateTitle({ label: 'Premium', unit: 'month' })).toEqual({ title: 'Premium' });
    expect(rateTitle({ unit: 'hour' })).toEqual({ title: 'Hourly' });
    expect(rateTitle({ unit: 'month' })).toEqual({ title: 'Monthly' });
    expect(rateTitle({ unit: 'block', blockHours: 4 })).toEqual({ title: '4-hour block' });
  });

  it('adds the capacity unless the label already says it', () => {
    expect(rateTitle({ label: 'Big', unit: 'hour', capacity: 10 })).toEqual({
      title: 'Big',
      note: '10 people',
    });
    expect(rateTitle({ unit: 'day', capacity: 1 })).toEqual({ title: 'Daily', note: '1 person' });
    expect(rateTitle({ label: '3 people', unit: 'month', capacity: 3 })).toEqual({
      title: '3 people',
    });
  });
});

describe('pricedBySize', () => {
  it('is true when every rate has a capacity', () => {
    const bySlug = (slug: Plan['slug']) => plansSeed.find((p) => p.slug === slug);
    expect(pricedBySize(bySlug('private-office') ?? { rates: [] })).toBe(true);
    expect(pricedBySize(bySlug('hot-desk') ?? { rates: [] })).toBe(false);
  });
});

describe('relatedPlans', () => {
  const slugs = (plans: readonly Plan[]) => plans.map((p) => p.slug);
  const bySlug = (slug: Plan['slug']): Plan => {
    const found = plansSeed.find((p) => p.slug === slug);
    if (!found) throw new Error(`seed has no ${slug}`);
    return found;
  };

  it('suggests the nearest plans in the lineup, in display order', () => {
    expect(slugs(relatedPlans(bySlug('private-office'), plansSeed))).toEqual([
      'business-seating',
      'executive-seating',
      'meeting-room',
    ]);
  });

  it('looks further along at either end of the lineup', () => {
    expect(slugs(relatedPlans(bySlug('hot-desk'), plansSeed))).toEqual([
      'business-seating',
      'executive-seating',
      'private-office',
    ]);
    expect(slugs(relatedPlans(bySlug('seminar-room'), plansSeed))).toEqual([
      'executive-seating',
      'private-office',
      'meeting-room',
    ]);
  });

  it('follows display order, not the input order, and never suggests the plan itself', () => {
    const shuffled = [...plansSeed].reverse();
    const related = relatedPlans(bySlug('business-seating'), shuffled, 2);
    expect(slugs(related)).toEqual(['hot-desk', 'executive-seating']);
  });

  it('copes with too few plans or a plan missing from the list', () => {
    expect(relatedPlans(bySlug('hot-desk'), [bySlug('hot-desk')])).toEqual([]);
    expect(slugs(relatedPlans(bySlug('hot-desk'), [bySlug('meeting-room')]))).toEqual([
      'meeting-room',
    ]);
  });
});

describe('planDescription', () => {
  it('gives the summary and the entry price', () => {
    const [hotDesk] = plansSeed;
    if (!hotDesk) throw new Error('seed has no plans');
    expect(planDescription(hotDesk)).toBe(
      'A designated hot desk by the hour or the day. From ৳100/hour, in the heart of Gulshan.',
    );
  });
});
