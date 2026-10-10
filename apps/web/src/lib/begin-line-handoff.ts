// The begin line's hand-off (docs/04-design-system.md §6, signature moment 2): when someone leaves
// Home through the nav, the hero's begin line flies up and becomes the underline of the nav item
// they chose. The hero records where its line was as it unmounts; the nav underline, mounting in
// the same commit, takes that record and animates from it (FLIP). A record nobody takes in time
// (a link to a page with no nav underline) simply expires.

export interface LineBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** A line's translate and horizontal scale relative to where it ends up, from its top-left. */
export interface HandoffTransform {
  x: number;
  y: number;
  scaleX: number;
}

interface Handoff {
  box: LineBox;
  at: number;
}

let pending: Handoff | null = null;

/** Keeps where the hero's line was, as it leaves, for the nav underline to start from. */
export function recordHandoff(box: LineBox, at: number): void {
  pending = { box, at };
}

/** Takes the recorded line once, if it was recorded no more than `maxAge` ms before `at`. */
export function takeHandoff(at: number, maxAge: number): LineBox | null {
  const handoff = pending;
  pending = null;
  if (!handoff || at - handoff.at > maxAge || at < handoff.at) return null;
  return handoff.box;
}

/** Whether any part of the box was inside a viewport of the given size. */
export function isOnScreen(box: LineBox, viewport: { width: number; height: number }): boolean {
  return (
    box.width > 0 &&
    box.top + box.height > 0 &&
    box.top < viewport.height &&
    box.left + box.width > 0 &&
    box.left < viewport.width
  );
}

/**
 * The transform that puts a line laid out at `to` where `from` was, scaled from its top-left
 * corner. `null` when either line has no width (a nav hidden on small screens), so nothing flies
 * to or from nowhere.
 */
export function handoffTransform(from: LineBox, to: LineBox): HandoffTransform | null {
  if (from.width <= 0 || to.width <= 0) return null;
  return { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width };
}
