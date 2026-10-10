import { afterEach, describe, expect, it } from 'vitest';

import { type LineBox } from '@/lib/begin-line-handoff';
import {
  coverTransform,
  MORPH_TTL,
  planPhotoName,
  recordMorph,
  takeMorph,
  type MorphSource,
} from '@/lib/plan-morph';

const card: MorphSource = { box: { left: 853, top: 200, width: 360, height: 450 }, radius: 12 };

afterEach(() => {
  takeMorph('', 0);
});

describe('plan photo morph', () => {
  it('names a plan photo the same on its card and its page', () => {
    expect(planPhotoName('hot-desk')).toBe('plan-photo-hot-desk');
  });

  it('hands the recorded card over once, to its own plan only', () => {
    recordMorph('hot-desk', card, 1000);
    expect(takeMorph('hot-desk', 1200)).toEqual(card);
    expect(takeMorph('hot-desk', 1300)).toBeNull();

    recordMorph('hot-desk', card, 1000);
    expect(takeMorph('meeting-room', 1200)).toBeNull();
    // A page for another plan clears it, so it can't surface later.
    expect(takeMorph('hot-desk', 1300)).toBeNull();
  });

  it('waits through a slow navigation, but not forever', () => {
    recordMorph('hot-desk', card, 1000);
    expect(takeMorph('hot-desk', 1000 + MORPH_TTL)).toEqual(card);
    recordMorph('hot-desk', card, 1000);
    expect(takeMorph('hot-desk', 1001 + MORPH_TTL)).toBeNull();
    recordMorph('hot-desk', card, 1000);
    expect(takeMorph('hot-desk', 999)).toBeNull();
  });
});

describe('coverTransform', () => {
  /** Where the transformed, clipped photo shows on screen. */
  function shown(to: LineBox, from: LineBox) {
    const move = coverTransform(from, to);
    if (!move) throw new Error('no transform');
    return {
      move,
      left: to.left + move.x + move.insetX * move.scale,
      top: to.top + move.y + move.insetY * move.scale,
      width: (to.width - 2 * move.insetX) * move.scale,
      height: (to.height - 2 * move.insetY) * move.scale,
    };
  }

  it('lays a wider photo over a portrait card, cropping its sides', () => {
    // Phone: a 4:5 card into the plan page's 3:2 photo.
    const to = { left: 20, top: 140, width: 350, height: 233 };
    const from = { left: 20, top: 400, width: 312, height: 390 };
    const { move, ...box } = shown(to, from);

    expect(move.scale).toBeCloseTo(390 / 233);
    expect(move.insetY).toBeCloseTo(0);
    expect(move.insetX).toBeGreaterThan(0);
    for (const [key, value] of Object.entries(from)) {
      expect(box[key as keyof typeof box]).toBeCloseTo(value);
    }
  });

  it('scales evenly and crops top and bottom for a wide card', () => {
    const to = { left: 64, top: 200, width: 450, height: 562 };
    const from = { left: 853, top: 100, width: 400, height: 250 };
    const { move, ...box } = shown(to, from);

    expect(move.insetX).toBeCloseTo(0);
    expect(move.insetY).toBeGreaterThan(0);
    for (const [key, value] of Object.entries(from)) {
      expect(box[key as keyof typeof box]).toBeCloseTo(value);
    }
  });

  it('is a plain move between boxes of the same size', () => {
    expect(
      coverTransform(
        { left: 10, top: 20, width: 100, height: 125 },
        { left: 0, top: 0, width: 100, height: 125 },
      ),
    ).toEqual({ x: 10, y: 20, scale: 1, insetX: 0, insetY: 0 });
  });

  it('does nothing for a box with no size', () => {
    const box = { left: 0, top: 0, width: 100, height: 100 };
    expect(coverTransform({ ...box, width: 0 }, box)).toBeNull();
    expect(coverTransform(box, { ...box, height: 0 })).toBeNull();
  });
});
