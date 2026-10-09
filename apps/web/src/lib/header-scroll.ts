/**
 * Scroll behavior of the site header (docs/05-pages-and-interactions.md): it condenses once
 * the page scrolls, hides on scroll-down and comes back on scroll-up. A pure reducer, so the
 * rules are unit-tested without a browser; `useHeaderScroll` feeds it scroll events.
 */

export interface HeaderScrollState {
  /** Scroll position the last direction change was measured from. */
  y: number;
  condensed: boolean;
  hidden: boolean;
}

export interface HeaderScrollInput {
  /** Current `window.scrollY`. Negative values (iOS overscroll) count as the top. */
  y: number;
  /** Keep the header in view: focus is inside it, or a menu it owns is open. */
  pinned: boolean;
  /** Height of the header, in px. It never hides while the page is scrolled less than this. */
  revealZone: number;
}

/** Past this many px the header condenses and takes its surface. */
export const CONDENSE_AFTER_PX = 8;
/** Scroll travel in one direction before the header hides or shows, so jitter can't flicker it. */
export const DIRECTION_TOLERANCE_PX = 12;

export const initialHeaderScroll: HeaderScrollState = { y: 0, condensed: false, hidden: false };

export function nextHeaderScroll(
  prev: HeaderScrollState,
  { y: rawY, pinned, revealZone }: HeaderScrollInput,
): HeaderScrollState {
  const y = Math.max(rawY, 0);
  const condensed = y > CONDENSE_AFTER_PX;

  if (pinned || y <= revealZone) return { y, condensed, hidden: false };

  const delta = y - prev.y;
  // Small moves add up from the same starting point until they cross the tolerance.
  if (Math.abs(delta) < DIRECTION_TOLERANCE_PX)
    return { y: prev.y, condensed, hidden: prev.hidden };
  return { y, condensed, hidden: delta > 0 };
}
