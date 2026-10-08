import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InquiryAccepted, InquiryCreate, isHoneypotTripped } from './inquiry';

const valid = {
  name: 'Nadia Rahman',
  email: 'nadia@example.com',
  message: 'Looking for a desk next month.',
};

const issuePaths = (input: unknown) => {
  const result = InquiryCreate.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'));
};

describe('InquiryCreate', () => {
  beforeEach(() => {
    // 2026-10-09 00:30 in Dhaka, which is still 2026-10-08 in UTC and in the CI timezone.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-09T00:30:00+06:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts the minimal valid inquiry', () => {
    expect(InquiryCreate.safeParse(valid).success).toBe(true);
  });

  it.each([
    [1, false],
    [2, true],
    [80, true],
    [81, false],
  ])('name of %i chars → valid: %s', (len, ok) => {
    expect(InquiryCreate.safeParse({ ...valid, name: 'a'.repeat(len) }).success).toBe(ok);
  });

  it('trims the name before measuring it', () => {
    expect(issuePaths({ ...valid, name: '  a  ' })).toEqual(['name']);
  });

  it.each([
    [9, false],
    [10, true],
    [2000, true],
    [2001, false],
  ])('message of %i chars → valid: %s', (len, ok) => {
    expect(InquiryCreate.safeParse({ ...valid, message: 'm'.repeat(len) }).success).toBe(ok);
  });

  it('rejects an invalid email with a friendly message', () => {
    const result = InquiryCreate.safeParse({ ...valid, email: 'nadia@' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Enter a valid email address.');
  });

  it.each(['+88 01700-766084', '01700766084', '+1 415 555 0100', '123456'])(
    'accepts phone %s',
    (phone) => {
      expect(InquiryCreate.safeParse({ ...valid, phone }).success).toBe(true);
    },
  );

  it.each(['12345', '1'.repeat(21), '01700 766084 ext 2', '(017) 00766084'])(
    'rejects phone %s',
    (phone) => {
      expect(issuePaths({ ...valid, phone })).toEqual(['phone']);
    },
  );

  it('treats empty optional inputs as not provided', () => {
    const result = InquiryCreate.parse({
      ...valid,
      phone: '',
      planSlug: '',
      rateId: '',
      teamSize: '',
      preferredDate: '',
    });
    expect(result.phone).toBeUndefined();
    expect(result.planSlug).toBeUndefined();
    expect(result.teamSize).toBeUndefined();
    expect(result.preferredDate).toBeUndefined();
  });

  it('accepts a known plan slug and rejects an unknown one', () => {
    expect(InquiryCreate.safeParse({ ...valid, planSlug: 'hot-desk' }).success).toBe(true);
    expect(issuePaths({ ...valid, planSlug: 'penthouse' })).toEqual(['planSlug']);
  });

  it.each([
    [0, false],
    [1, true],
    [100, true],
    [101, false],
    [2.5, false],
  ])('team size %s → valid: %s', (teamSize, ok) => {
    expect(InquiryCreate.safeParse({ ...valid, teamSize }).success).toBe(ok);
  });

  it('coerces a team size typed into a form field', () => {
    expect(InquiryCreate.parse({ ...valid, teamSize: '4' }).teamSize).toBe(4);
  });

  it.each([
    ['2026-10-08', false], // yesterday in Dhaka (but "today" in UTC)
    ['2026-10-09', true], // today in Dhaka
    ['2027-10-09', true], // exactly one year ahead
    ['2027-10-10', false],
    ['2026-13-01', false],
    ['09/10/2026', false],
  ])('preferred date %s → valid: %s', (preferredDate, ok) => {
    expect(InquiryCreate.safeParse({ ...valid, preferredDate }).success).toBe(ok);
  });

  it('accepts a filled honeypot (so bots are not tipped off) but flags it', () => {
    const parsed = InquiryCreate.parse({ ...valid, website: 'https://spam.example' });
    expect(isHoneypotTripped(parsed)).toBe(true);
    expect(isHoneypotTripped(InquiryCreate.parse(valid))).toBe(false);
    expect(isHoneypotTripped(InquiryCreate.parse({ ...valid, website: '   ' }))).toBe(false);
  });
});

describe('InquiryAccepted', () => {
  it('requires an id and an ISO timestamp', () => {
    expect(
      InquiryAccepted.safeParse({ id: 'inq_1', receivedAt: '2026-10-08T10:00:00.000Z' }).success,
    ).toBe(true);
    expect(InquiryAccepted.safeParse({ id: 'inq_1', receivedAt: 'yesterday' }).success).toBe(false);
  });
});
