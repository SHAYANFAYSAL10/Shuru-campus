import { describe, expect, it } from 'vitest';

import { siteSeed, type OpeningHours } from '@campus/contracts';

import { hoursByDay, hoursSummary } from '@/lib/hours-summary';

function week(times: Record<number, [string, string] | null>): OpeningHours {
  return {
    timezone: 'Asia/Dhaka',
    weekly: [0, 1, 2, 3, 4, 5, 6].map((day) => {
      const time = times[day] ?? null;
      return { day, open: time?.[0] ?? null, close: time?.[1] ?? null };
    }),
  };
}

describe('hoursSummary', () => {
  it('folds the seed week into Saturday–Thursday and a closed Friday', () => {
    expect(hoursSummary(siteSeed.hours)).toEqual([
      { days: 'Sat–Thu', daysLong: 'Saturday to Thursday', time: '9:00–19:00' },
      { days: 'Fri', daysLong: 'Friday', time: null },
    ]);
  });

  it('joins a run of two days with "and", not a range', () => {
    const hours = week({ 6: ['10:00', '14:00'], 0: ['10:00', '14:00'] });
    expect(hoursSummary(hours)).toEqual([
      { days: 'Sat, Sun', daysLong: 'Saturday and Sunday', time: '10:00–14:00' },
      { days: 'Mon–Fri', daysLong: 'Monday to Friday', time: null },
    ]);
  });

  it('splits days whose times differ, even when they are neighbours', () => {
    const hours = week({ 6: ['09:00', '19:00'], 0: ['09:00', '17:00'] });
    expect(hoursSummary(hours).map((row) => row.days)).toEqual(['Sat', 'Sun', 'Mon–Fri']);
  });
});

describe('hoursByDay', () => {
  it('lists the seed week from Saturday, one row per day', () => {
    const rows = hoursByDay(siteSeed.hours);
    expect(rows.map((row) => row.name)).toEqual([
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ]);
    expect(rows[0]).toEqual({ day: 6, name: 'Saturday', time: '9:00–19:00' });
    expect(rows.at(-1)).toEqual({ day: 5, name: 'Friday', time: null });
  });

  it('keeps each day’s own times', () => {
    const rows = hoursByDay(week({ 4: ['09:30', '13:00'] }));
    expect(rows.find((row) => row.day === 4)?.time).toBe('9:30–13:00');
    expect(rows.filter((row) => row.time === null)).toHaveLength(6);
  });
});
