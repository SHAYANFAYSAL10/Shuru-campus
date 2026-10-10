import { describe, expect, it } from 'vitest';

import { magneticOffset } from '@/lib/magnetic';

const box = { left: 100, top: 50, width: 200, height: 52 };
const length = ({ x, y }: { x: number; y: number }) => Math.hypot(x, y);

describe('magneticOffset', () => {
  it('stays put with the pointer at the centre', () => {
    const offset = magneticOffset({ x: 200, y: 76 }, box, 6);
    expect(offset.x).toBeCloseTo(0);
    expect(offset.y).toBeCloseTo(0);
  });

  it('pulls toward the pointer, growing toward the edge', () => {
    expect(magneticOffset({ x: 250, y: 76 }, box, 6).x).toBeCloseTo(3);
    expect(magneticOffset({ x: 300, y: 76 }, box, 6).x).toBeCloseTo(6);
    expect(magneticOffset({ x: 200, y: 50 }, box, 6).y).toBeCloseTo(-6);
  });

  it('never pulls further than the strength, even at a corner or outside the box', () => {
    for (const pointer of [
      { x: 300, y: 102 },
      { x: 100, y: 50 },
      { x: 400, y: 200 },
      { x: -50, y: 76 },
    ]) {
      expect(length(magneticOffset(pointer, box, 6))).toBeLessThanOrEqual(6 + 1e-9);
    }
    const corner = magneticOffset({ x: 300, y: 102 }, box, 6);
    expect(corner.x).toBeCloseTo(corner.y);
  });

  it('does nothing for a box with no size', () => {
    expect(magneticOffset({ x: 10, y: 10 }, { ...box, width: 0 }, 6)).toEqual({ x: 0, y: 0 });
  });
});
