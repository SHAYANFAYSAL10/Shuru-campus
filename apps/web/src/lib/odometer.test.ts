import { describe, expect, it } from 'vitest';

import { odometerColumns } from '@/lib/odometer';

describe('odometerColumns', () => {
  it('turns digits into rolling columns and keeps separators fixed', () => {
    expect(odometerColumns('2,800')).toEqual([
      { key: 'p4', kind: 'digit', digit: 2, rank: 3 },
      { key: 'p3', kind: 'static', char: ',' },
      { key: 'p2', kind: 'digit', digit: 8, rank: 2 },
      { key: 'p1', kind: 'digit', digit: 0, rank: 1 },
      { key: 'p0', kind: 'digit', digit: 0, rank: 0 },
    ]);
  });

  it('keys places from the right, so a longer figure only adds columns on the left', () => {
    const short = odometerColumns('2,800').map((column) => column.key);
    const long = odometerColumns('10,000').map((column) => column.key);
    expect(long.slice(1)).toEqual(short);
    expect(long[0]).toBe('p5');
  });

  it('handles a single digit, a sign and an empty figure', () => {
    expect(odometerColumns('7')).toEqual([{ key: 'p0', kind: 'digit', digit: 7, rank: 0 }]);
    expect(odometerColumns('−5')).toEqual([
      { key: 'p1', kind: 'static', char: '−' },
      { key: 'p0', kind: 'digit', digit: 5, rank: 0 },
    ]);
    expect(odometerColumns('')).toEqual([]);
  });
});
