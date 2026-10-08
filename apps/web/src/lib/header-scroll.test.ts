import { describe, expect, it } from 'vitest';

import {
  CONDENSE_AFTER_PX,
  DIRECTION_TOLERANCE_PX,
  initialHeaderScroll,
  nextHeaderScroll,
  type HeaderScrollState,
} from '@/lib/header-scroll';

const ZONE = 80;

function scrollThrough(positions: number[], pinned = false): HeaderScrollState {
  return positions.reduce(
    (state, y) => nextHeaderScroll(state, { y, pinned, revealZone: ZONE }),
    initialHeaderScroll,
  );
}

describe('nextHeaderScroll', () => {
  it('stays expanded and visible at the top', () => {
    expect(scrollThrough([0])).toMatchObject({ condensed: false, hidden: false });
    expect(scrollThrough([CONDENSE_AFTER_PX])).toMatchObject({ condensed: false });
  });

  it('condenses as soon as the page scrolls', () => {
    expect(scrollThrough([CONDENSE_AFTER_PX + 1])).toMatchObject({
      condensed: true,
      hidden: false,
    });
  });

  it('never hides while the header still covers its own height', () => {
    expect(scrollThrough([20, 40, ZONE])).toMatchObject({ hidden: false });
  });

  it('hides on scroll-down and shows on scroll-up', () => {
    expect(scrollThrough([200, 400])).toMatchObject({ hidden: true });
    expect(scrollThrough([200, 400, 300])).toMatchObject({ hidden: false, condensed: true });
  });

  it('ignores jitter below the tolerance, but adds small moves up', () => {
    const step = DIRECTION_TOLERANCE_PX / 2;
    const hidden = scrollThrough([200, 400]);
    const jittered = nextHeaderScroll(hidden, { y: 400 - step, pinned: false, revealZone: ZONE });
    expect(jittered).toMatchObject({ hidden: true, y: 400 });

    const shown = nextHeaderScroll(jittered, {
      y: 400 - 2 * step,
      pinned: false,
      revealZone: ZONE,
    });
    expect(shown).toMatchObject({ hidden: false });
  });

  it('stays visible while pinned (focus inside, menu open)', () => {
    expect(scrollThrough([200, 400, 600], true)).toMatchObject({ hidden: false });
  });

  it('treats overscroll above the top as the top', () => {
    expect(scrollThrough([-40])).toEqual({ y: 0, condensed: false, hidden: false });
  });
});
