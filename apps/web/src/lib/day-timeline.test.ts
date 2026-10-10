import { describe, expect, it } from 'vitest';

import {
  DAY_MOMENTS,
  dayPosition,
  highlightIndex,
  minutesToTime,
  stretchFill,
  timeToMinutes,
} from '@/lib/day-timeline';

describe('DAY_MOMENTS', () => {
  it('runs from opening to closing, in order (05 → Home #6)', () => {
    const times = DAY_MOMENTS.map((moment) => moment.time);
    expect(times).toEqual(['09:00', '10:00', '13:00', '15:00', '17:00', '19:00']);
    const ids = DAY_MOMENTS.map((moment) => moment.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('timeToMinutes / minutesToTime', () => {
  it('converts both ways', () => {
    expect(timeToMinutes('09:30')).toBe(570);
    expect(timeToMinutes('19:00')).toBe(1140);
    expect(minutesToTime(570)).toBe('9:30');
    expect(minutesToTime(14 * 60 + 5)).toBe('14:05');
  });
});

describe('dayPosition', () => {
  const at = (time: string) => dayPosition(DAY_MOMENTS, timeToMinutes(time));

  it('is null before opening and after closing', () => {
    expect(at('08:59')).toBeNull();
    expect(at('19:01')).toBeNull();
    expect(dayPosition([], 600)).toBeNull();
  });

  it('lands on a moment exactly at its time', () => {
    expect(at('09:00')).toEqual({ index: 0, fraction: 0 });
    expect(at('13:00')).toEqual({ index: 2, fraction: 0 });
    expect(at('19:00')).toEqual({ index: 5, fraction: 0 });
  });

  it('scales each stretch to its own length of time', () => {
    // 9:00 → 10:00 is an hour; 10:00 → 13:00 is three.
    expect(at('09:30')).toEqual({ index: 0, fraction: 0.5 });
    expect(at('11:30')).toEqual({ index: 1, fraction: 0.5 });
    expect(at('18:00')).toEqual({ index: 4, fraction: 0.5 });
  });
});

describe('stretchFill', () => {
  const position = { index: 2, fraction: 0.25 };

  it('fills behind the current time, partly in its stretch, and not ahead', () => {
    expect([0, 1, 2, 3, 4, 5].map((i) => stretchFill(position, i))).toEqual([1, 1, 0.25, 0, 0, 0]);
  });

  it('is empty without a current time', () => {
    expect(stretchFill(null, 0)).toBe(0);
  });
});

describe('highlightIndex', () => {
  it('maps the ends of the scroll to the first and last moment', () => {
    expect(highlightIndex(0, 6)).toBe(0);
    expect(highlightIndex(1, 6)).toBe(5);
    expect(highlightIndex(0.5, 6)).toBe(3);
    expect(highlightIndex(0.45, 6)).toBe(2);
  });

  it('clamps out-of-range progress and empty lists', () => {
    expect(highlightIndex(-1, 6)).toBe(0);
    expect(highlightIndex(2, 6)).toBe(5);
    expect(highlightIndex(0.5, 0)).toBe(0);
  });
});
