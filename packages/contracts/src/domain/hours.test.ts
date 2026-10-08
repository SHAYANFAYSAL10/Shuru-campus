import { afterEach, describe, expect, it } from 'vitest';

import { addYearsIso, dhakaParts, dhakaToday } from './dhaka-time';
import { isOpenAt, nextChange } from './hours';
import { type OpeningHours } from '../schemas/site';
import { siteSeed } from '../seed/site';

const hours = siteSeed.hours;
/** Dhaka wall-clock instant. 2026-10-08 is a Thursday, 2026-10-09 a Friday. */
const dhaka = (local: string) => new Date(`${local}+06:00`);

describe('dhakaParts', () => {
  it('reads Dhaka wall-clock time, not UTC or the machine timezone', () => {
    // 2026-10-08 20:30 UTC is already Friday 02:30 in Dhaka.
    expect(dhakaParts(new Date('2026-10-08T20:30:00Z'))).toEqual({
      date: '2026-10-09',
      weekday: 5,
      minutes: 150,
    });
  });

  it('reports midnight as 0 minutes, not 24:00', () => {
    expect(dhakaParts(dhaka('2026-10-09T00:00:00')).minutes).toBe(0);
  });
});

describe('dhakaToday / addYearsIso', () => {
  it('uses the Dhaka calendar date', () => {
    expect(dhakaToday(new Date('2026-10-08T18:00:00Z'))).toBe('2026-10-09');
  });

  it('adds years, rolling Feb 29 forward', () => {
    expect(addYearsIso('2026-10-09', 1)).toBe('2027-10-09');
    expect(addYearsIso('2028-02-29', 1)).toBe('2029-03-01');
  });
});

describe('isOpenAt', () => {
  it.each([
    ['2026-10-08T08:59:00', false], // Thursday, a minute before opening
    ['2026-10-08T09:00:00', true], // opening is inclusive
    ['2026-10-08T18:59:00', true],
    ['2026-10-08T19:00:00', false], // closing is exclusive
    ['2026-10-09T09:00:00', false], // Friday is closed (docs/08-testing.md)
    ['2026-10-09T12:00:00', false],
    ['2026-10-10T10:00:00', true], // Saturday
    ['2026-10-11T00:00:00', false], // Sunday midnight
  ])('Dhaka %s → open: %s', (local, open) => {
    expect(isOpenAt(hours, dhaka(local))).toBe(open);
  });

  it('is false when the weekday is missing from the schedule', () => {
    const partial = { ...hours, weekly: hours.weekly.filter((d) => d.day !== 4) } as OpeningHours;
    expect(isOpenAt(partial, dhaka('2026-10-08T10:00:00'))).toBe(false);
  });
});

describe('nextChange', () => {
  it('counts down to closing when open (Thursday 18:30 → closes in 30 min)', () => {
    expect(nextChange(hours, dhaka('2026-10-08T18:30:00'))).toEqual({
      isOpen: true,
      kind: 'closes',
      at: dhaka('2026-10-08T19:00:00'),
      minutesUntil: 30,
      dayOffset: 0,
      weekday: 4,
    });
  });

  it('rounds partial minutes up so the countdown never shows 0 early', () => {
    expect(nextChange(hours, dhaka('2026-10-08T18:59:30'))?.minutesUntil).toBe(1);
  });

  it('opens later today when before opening', () => {
    expect(nextChange(hours, dhaka('2026-10-08T08:59:00'))).toMatchObject({
      isOpen: false,
      kind: 'opens',
      at: dhaka('2026-10-08T09:00:00'),
      minutesUntil: 1,
      dayOffset: 0,
    });
  });

  it('skips closed Friday: Thursday 19:00 → opens Saturday 09:00', () => {
    expect(nextChange(hours, dhaka('2026-10-08T19:00:00'))).toMatchObject({
      kind: 'opens',
      at: dhaka('2026-10-10T09:00:00'),
      dayOffset: 2,
      weekday: 6,
    });
  });

  it('on Friday, opens Saturday 09:00', () => {
    expect(nextChange(hours, dhaka('2026-10-09T09:00:00'))).toMatchObject({
      kind: 'opens',
      at: dhaka('2026-10-10T09:00:00'),
      dayOffset: 1,
    });
  });

  it('rolls over midnight: Wednesday 23:59 → opens Thursday 09:00', () => {
    expect(nextChange(hours, dhaka('2026-10-07T23:59:00'))).toMatchObject({
      kind: 'opens',
      at: dhaka('2026-10-08T09:00:00'),
      dayOffset: 1,
      minutesUntil: 541,
    });
  });

  it('rolls over the month and year boundary (Thu 31 Dec → skips Fri 1 Jan → Sat 2 Jan)', () => {
    expect(nextChange(hours, dhaka('2026-12-31T20:00:00'))?.at).toEqual(
      dhaka('2027-01-02T09:00:00'),
    );
  });

  it('returns null when every day is closed', () => {
    const closed: OpeningHours = {
      timezone: 'Asia/Dhaka',
      weekly: hours.weekly.map((d) => ({ day: d.day, open: null, close: null })),
    };
    expect(nextChange(closed, dhaka('2026-10-08T10:00:00'))).toBeNull();
  });

  it('finds the same weekday next week when it is the only open day', () => {
    const thursdaysOnly: OpeningHours = {
      timezone: 'Asia/Dhaka',
      weekly: hours.weekly.map((d) => (d.day === 4 ? d : { day: d.day, open: null, close: null })),
    };
    expect(nextChange(thursdaysOnly, dhaka('2026-10-08T20:00:00'))).toMatchObject({
      at: dhaka('2026-10-15T09:00:00'),
      dayOffset: 7,
    });
  });
});

describe('machine timezone independence', () => {
  const original = process.env.TZ;
  afterEach(() => {
    process.env.TZ = original;
  });

  it.each(['America/Los_Angeles', 'Pacific/Kiritimati', 'UTC', 'Asia/Dhaka'])(
    'gives identical answers with TZ=%s',
    (tz) => {
      process.env.TZ = tz;
      const thursdayEvening = dhaka('2026-10-08T18:30:00');
      expect(isOpenAt(hours, thursdayEvening)).toBe(true);
      expect(nextChange(hours, thursdayEvening)?.minutesUntil).toBe(30);
      expect(isOpenAt(hours, dhaka('2026-10-09T10:00:00'))).toBe(false);
      expect(nextChange(hours, dhaka('2026-10-08T19:00:00'))?.at).toEqual(
        dhaka('2026-10-10T09:00:00'),
      );
    },
  );
});
