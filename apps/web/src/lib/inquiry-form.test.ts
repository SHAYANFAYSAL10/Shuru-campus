import { describe, expect, it } from 'vitest';

import { plansSeed } from '@campus/contracts';

import {
  EMPTY_FORM_VALUES,
  failureMessage,
  fieldErrorsFrom,
  fieldForPath,
  firstInvalidField,
  formatPreferredDate,
  formValues,
  initialInterest,
  interestGroups,
  interestLabel,
  interestValue,
  parseInterest,
  toInquiryInput,
} from '@/lib/inquiry-form';

describe('interest values', () => {
  it('joins and splits a plan and a rate', () => {
    expect(interestValue('meeting-room', 'big')).toBe('meeting-room:big');
    expect(interestValue('hot-desk')).toBe('hot-desk');
    expect(parseInterest('meeting-room:big')).toEqual({ planSlug: 'meeting-room', rateId: 'big' });
    expect(parseInterest('hot-desk')).toEqual({ planSlug: 'hot-desk' });
    expect(parseInterest('')).toEqual({});
    expect(parseInterest(undefined)).toEqual({});
  });
});

describe('interestGroups', () => {
  const groups = interestGroups(plansSeed);

  it('lists every plan in display order, each with "any option" and its rates', () => {
    expect(groups.map((g) => g.label)).toEqual([
      'Hot Desk',
      'Business Seating',
      'Executive Seating',
      'Private Office',
      'Meeting Room',
      'Seminar Room',
    ]);
    for (const [index, group] of groups.entries()) {
      const plan = plansSeed.find((p) => p.name === group.label);
      expect(group.options[0]?.label, `group ${String(index)}`).toBe(`${group.label}, any option`);
      expect(group.options).toHaveLength((plan?.rates.length ?? 0) + 1);
    }
  });

  it('names each rate with its size and price', () => {
    const meeting = groups.find((g) => g.label === 'Meeting Room');
    expect(meeting?.options[1]).toEqual({
      value: 'meeting-room:big',
      label: 'Meeting Room · Big, 10 people · ৳1,000/hour',
    });
    const hotDesk = groups.find((g) => g.label === 'Hot Desk');
    expect(hotDesk?.options[1]?.label).toBe('Hot Desk · Hourly · ৳100/hour');
  });

  it('labels a choice for the confirmation', () => {
    expect(interestLabel(groups, 'meeting-room:big')).toBe(
      'Meeting Room · Big, 10 people · ৳1,000/hour',
    );
    expect(interestLabel(groups, 'hot-desk')).toBe('Hot Desk');
    expect(interestLabel(groups, 'penthouse')).toBeUndefined();
  });
});

describe('initialInterest', () => {
  it('pre-selects the plan and rate from a "Book this" link', () => {
    expect(initialInterest(plansSeed, 'meeting-room', 'big')).toBe('meeting-room:big');
  });

  it('falls back to the plan when the rate is not one of its own', () => {
    expect(initialInterest(plansSeed, 'hot-desk', 'big')).toBe('hot-desk');
    expect(initialInterest(plansSeed, 'hot-desk', undefined)).toBe('hot-desk');
  });

  it('ignores an unknown plan', () => {
    expect(initialInterest(plansSeed, 'penthouse', 'big')).toBe('');
    expect(initialInterest(plansSeed, undefined, undefined)).toBe('');
    expect(initialInterest([], 'hot-desk', undefined)).toBe('');
  });
});

describe('form data', () => {
  it('reads every field, missing ones as empty, files as empty', () => {
    const data = new FormData();
    data.set('name', 'Nadia');
    data.set('message', new Blob(['x']));
    expect(formValues(data)).toEqual({ ...EMPTY_FORM_VALUES, name: 'Nadia' });
  });

  it('splits the interest back into the contract fields', () => {
    expect(
      toInquiryInput({ ...EMPTY_FORM_VALUES, name: 'Nadia', interest: 'meeting-room:big' }),
    ).toMatchObject({ name: 'Nadia', planSlug: 'meeting-room', rateId: 'big' });
    expect(toInquiryInput(EMPTY_FORM_VALUES)).not.toHaveProperty('planSlug');
  });
});

describe('field errors', () => {
  it('maps contract paths to the fields that show them', () => {
    expect(fieldForPath('planSlug')).toBe('interest');
    expect(fieldForPath('rateId')).toBe('interest');
    expect(fieldForPath('email')).toBe('email');
    expect(fieldForPath('')).toBeUndefined();
  });

  it('keeps the first message per field and returns the rest', () => {
    expect(
      fieldErrorsFrom([
        { path: 'email', message: 'Enter a valid email address.' },
        { path: 'email', message: 'Too long.' },
        { path: 'planSlug', message: 'Unknown plan.' },
        { path: '', message: 'Body must be JSON.' },
      ]),
    ).toEqual({
      fieldErrors: { email: 'Enter a valid email address.', interest: 'Unknown plan.' },
      unmatched: ['Body must be JSON.'],
    });
  });

  it('finds the first invalid field in form order', () => {
    expect(firstInvalidField({ message: 'x', email: 'y' })).toBe('email');
    expect(firstInvalidField({})).toBeUndefined();
  });
});

describe('failureMessage', () => {
  const http = (status: number, retryAfterS?: number) => ({
    kind: 'http' as const,
    status,
    code: 'INTERNAL' as const,
    message: 'Internal',
    details: [],
    ...(retryAfterS === undefined ? {} : { retryAfterS }),
  });

  it('asks to check the connection when the request never left', () => {
    expect(failureMessage({ kind: 'offline' })).toMatch(/Check your connection/);
  });

  it('never shows the raw error', () => {
    for (const error of [
      http(500),
      { kind: 'timeout' as const, timeoutMs: 8000 },
      { kind: 'network' as const, message: 'ECONNREFUSED' },
      { kind: 'invalid-response' as const, status: 202, details: [] },
    ]) {
      expect(failureMessage(error)).toBe(
        'We couldn’t send that just now. Try again in a moment, or call or email us.',
      );
    }
  });

  it.each([
    [undefined, 'in a minute'],
    [0, 'in a minute'],
    [1, 'in 1 second'],
    [45, 'in 45 seconds'],
    [90, 'in 2 minutes'],
  ])('says when to retry after a rate limit (Retry-After %s)', (retryAfterS, when) => {
    expect(failureMessage(http(429, retryAfterS))).toBe(
      `That’s a few inquiries in a row. Try again ${when}, or call or email us.`,
    );
  });
});

describe('formatPreferredDate', () => {
  it('reads an ISO date as a calendar date, whatever the time zone', () => {
    // ICU versions differ on the comma after the weekday.
    expect(formatPreferredDate('2026-10-10')).toMatch(/^Saturday,? 10 October 2026$/);
  });

  it('passes through what it cannot read', () => {
    expect(formatPreferredDate('soon')).toBe('soon');
  });
});
