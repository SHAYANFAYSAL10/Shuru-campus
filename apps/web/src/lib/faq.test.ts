import { describe, expect, it } from 'vitest';

import { plansSeed, siteSeed, type OpeningHours } from '@campus/contracts';

import { openingHoursAnswer, spacesFaq } from '@/lib/faq';

const { hours } = siteSeed;

describe('openingHoursAnswer', () => {
  it('says when we’re open and the day we’re closed', () => {
    expect(openingHoursAnswer(hours)).toBe(
      'We’re open Saturday to Thursday, 9:00–19:00, and closed on Friday. All times are Dhaka time.',
    );
  });

  it('leaves out the closed part when open every day', () => {
    const everyDay: OpeningHours = {
      ...hours,
      weekly: hours.weekly.map((day) => ({ ...day, open: '09:00', close: '19:00' })),
    };
    expect(openingHoursAnswer(everyDay)).toBe(
      'We’re open Saturday to Friday, 9:00–19:00. All times are Dhaka time.',
    );
  });

  it('says so when never open', () => {
    const never: OpeningHours = {
      ...hours,
      weekly: hours.weekly.map((day) => ({ ...day, open: null, close: null })),
    };
    expect(openingHoursAnswer(never)).toBe('We’re closed at the moment.');
  });
});

describe('spacesFaq', () => {
  it('answers the five questions, in order', () => {
    expect(spacesFaq({ hours, plans: plansSeed }).map((item) => item.id)).toEqual([
      'business-address',
      'refunds',
      'opening-hours',
      'guests',
      'internet',
    ]);
  });

  it('links policy answers to the full policy', () => {
    const faq = spacesFaq({ hours, plans: plansSeed });
    expect(faq.find((item) => item.id === 'refunds')?.link?.href).toBe('/legal/refund');
    expect(faq.find((item) => item.id === 'business-address')?.link?.href).toBe('/legal/terms');
  });

  it('takes the internet speed from the plans', () => {
    const faq = spacesFaq({ hours, plans: plansSeed });
    expect(faq.find((item) => item.id === 'internet')?.answer[0]).toMatch(
      /^Up to 40 Mbps internet, included with every plan\./,
    );
  });

  it('names the plans with internet when not all have it', () => {
    const [first, second] = plansSeed;
    if (!first || !second) throw new Error('seed too small');
    const faq = spacesFaq({ hours, plans: [first, { ...second, features: [] }] });
    expect(faq.find((item) => item.id === 'internet')?.answer[0]).toContain(
      `included with ${first.name}.`,
    );
  });

  it('skips the internet question when no plan lists it', () => {
    const plans = plansSeed.map((plan) => ({ ...plan, features: [] }));
    expect(spacesFaq({ hours, plans }).map((item) => item.id)).not.toContain('internet');
  });
});
