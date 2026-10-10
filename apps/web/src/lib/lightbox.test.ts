import { describe, expect, it } from 'vitest';

import {
  keyStep,
  lightboxCounter,
  lightboxSizes,
  lightboxStatus,
  neighbourIndices,
  SWIPE_VELOCITY,
  swipeStep,
  wrapIndex,
} from '@/lib/lightbox';

describe('wrapIndex', () => {
  it('goes round from either end', () => {
    expect(wrapIndex(0, 5)).toBe(0);
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(12, 5)).toBe(2);
  });

  it('stays at 0 with nothing to show', () => {
    expect(wrapIndex(3, 0)).toBe(0);
  });
});

describe('neighbourIndices', () => {
  it('preloads the next photo, then the previous one', () => {
    expect(neighbourIndices(2, 5)).toEqual([3, 1]);
    expect(neighbourIndices(0, 5)).toEqual([1, 4]);
    expect(neighbourIndices(4, 5)).toEqual([0, 3]);
  });

  it('preloads the other photo once when there are two, and none for one', () => {
    expect(neighbourIndices(0, 2)).toEqual([1]);
    expect(neighbourIndices(0, 1)).toEqual([]);
    expect(neighbourIndices(0, 0)).toEqual([]);
  });
});

describe('keyStep', () => {
  it('steps with the arrows, round from either end', () => {
    expect(keyStep('ArrowRight', 1, 4)).toEqual({ index: 2, direction: 1 });
    expect(keyStep('ArrowRight', 3, 4)).toEqual({ index: 0, direction: 1 });
    expect(keyStep('ArrowLeft', 0, 4)).toEqual({ index: 3, direction: -1 });
  });

  it('jumps to the first and last photo, unless already there', () => {
    expect(keyStep('Home', 2, 4)).toEqual({ index: 0, direction: -1 });
    expect(keyStep('End', 1, 4)).toEqual({ index: 3, direction: 1 });
    expect(keyStep('Home', 0, 4)).toBeNull();
    expect(keyStep('End', 3, 4)).toBeNull();
  });

  it('ignores other keys, and every key with one photo', () => {
    expect(keyStep('Enter', 1, 4)).toBeNull();
    expect(keyStep('ArrowUp', 1, 4)).toBeNull();
    expect(keyStep('ArrowRight', 0, 1)).toBeNull();
  });
});

describe('swipeStep', () => {
  const width = 400;

  it('moves on once a drag travels a fifth of the stage', () => {
    expect(swipeStep(-80, 0, width)).toBe(1);
    expect(swipeStep(80, 0, width)).toBe(-1);
    expect(swipeStep(-79, 0, width)).toBe(0);
  });

  it('moves on for a quick flick in the direction it travelled', () => {
    expect(swipeStep(-20, -SWIPE_VELOCITY, width)).toBe(1);
    expect(swipeStep(20, SWIPE_VELOCITY, width)).toBe(-1);
    // Dragged left, but let go moving right: it settles back.
    expect(swipeStep(-20, SWIPE_VELOCITY, width)).toBe(0);
  });

  it('settles back with no travel or no stage', () => {
    expect(swipeStep(0, -SWIPE_VELOCITY, width)).toBe(0);
    expect(swipeStep(-80, 0, 0)).toBe(0);
  });
});

describe('lightboxSizes', () => {
  it('limits a photo by the viewport height times its ratio', () => {
    expect(lightboxSizes({ width: 1600, height: 1067 })).toBe('min(100vw, 150vh)');
    expect(lightboxSizes({ width: 1200, height: 1500 })).toBe('min(100vw, 80vh)');
  });
});

describe('lightbox wording', () => {
  it('pads the counter to the total, so it keeps its width', () => {
    expect(lightboxCounter(2, 10)).toBe('03 / 10');
    expect(lightboxCounter(0, 4)).toBe('1 / 4');
    expect(lightboxCounter(99, 120)).toBe('100 / 120');
  });

  it('says which photo is showing', () => {
    expect(lightboxStatus(2, 10, 'a barista at the café counter')).toBe(
      'Photo 3 of 10: a barista at the café counter',
    );
  });
});
