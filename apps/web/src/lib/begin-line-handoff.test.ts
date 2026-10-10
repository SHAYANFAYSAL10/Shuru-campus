import { afterEach, describe, expect, it } from 'vitest';

import {
  handoffTransform,
  isOnScreen,
  recordHandoff,
  takeHandoff,
  type LineBox,
} from '@/lib/begin-line-handoff';

const hero: LineBox = { left: 40, top: 300, width: 400, height: 4 };
const nav: LineBox = { left: 520, top: 50, width: 80, height: 4 };
const viewport = { width: 1280, height: 800 };

afterEach(() => {
  takeHandoff(0, 0);
});

describe('begin line hand-off', () => {
  it('hands the recorded line over once', () => {
    recordHandoff(hero, 1000);
    expect(takeHandoff(1010, 320)).toEqual(hero);
    expect(takeHandoff(1020, 320)).toBeNull();
  });

  it('lets a line nobody took in time expire', () => {
    recordHandoff(hero, 1000);
    expect(takeHandoff(1400, 320)).toBeNull();
  });

  it('ignores a record from the future (a clock that went back)', () => {
    recordHandoff(hero, 1000);
    expect(takeHandoff(900, 320)).toBeNull();
  });

  it('keeps only the latest record', () => {
    recordHandoff(nav, 1000);
    recordHandoff(hero, 1005);
    expect(takeHandoff(1010, 320)).toEqual(hero);
  });

  it('only hands off a line the reader could see', () => {
    expect(isOnScreen(hero, viewport)).toBe(true);
    expect(isOnScreen({ ...hero, top: -10, height: 4 }, viewport)).toBe(false);
    expect(isOnScreen({ ...hero, top: -2 }, viewport)).toBe(true);
    expect(isOnScreen({ ...hero, top: 800 }, viewport)).toBe(false);
    expect(isOnScreen({ ...hero, left: 1280 }, viewport)).toBe(false);
    expect(isOnScreen({ ...hero, left: -400 }, viewport)).toBe(false);
    expect(isOnScreen({ ...hero, width: 0 }, viewport)).toBe(false);
  });

  it('starts the nav line where the hero line was, scaled from its top-left', () => {
    expect(handoffTransform(hero, nav)).toEqual({ x: -480, y: 250, scaleX: 5 });
  });

  it('flies nothing to or from a line with no width', () => {
    expect(handoffTransform(hero, { ...nav, width: 0 })).toBeNull();
    expect(handoffTransform({ ...hero, width: 0 }, nav)).toBeNull();
  });
});
