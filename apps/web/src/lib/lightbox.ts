// Gallery lightbox (docs/04-design-system.md §6, signature moment 6): the pure parts. Which photo
// a step lands on, which neighbours to preload, how far a swipe has to go, and what the viewer
// says as it changes.

/** `index` wrapped into `0..length-1`, so stepping past either end goes round. */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

/** The photos either side of `index`, to preload: none for one photo, the other one for two. */
export function neighbourIndices(index: number, length: number): number[] {
  if (length <= 1) return [];
  const next = wrapIndex(index + 1, length);
  const previous = wrapIndex(index - 1, length);
  return previous === next ? [next] : [next, previous];
}

/** A move to another photo, and which way it slides in: `1` from the right, `-1` from the left. */
export interface LightboxStep {
  index: number;
  direction: -1 | 1;
}

/** Where a key moves the viewer, or `null` for keys it doesn't handle (or nowhere to go). */
export function keyStep(key: string, index: number, length: number): LightboxStep | null {
  if (length <= 1) return null;
  switch (key) {
    case 'ArrowRight':
      return { index: wrapIndex(index + 1, length), direction: 1 };
    case 'ArrowLeft':
      return { index: wrapIndex(index - 1, length), direction: -1 };
    case 'Home':
      return index === 0 ? null : { index: 0, direction: -1 };
    case 'End':
      return index === length - 1 ? null : { index: length - 1, direction: 1 };
    default:
      return null;
  }
}

/** A swipe changes the photo once it travels this share of the stage's width… */
export const SWIPE_DISTANCE = 0.2;
/** …or once it's flicked at least this fast, in px per second. */
export const SWIPE_VELOCITY = 400;

/**
 * Which way a finished horizontal drag moves: `1` for the next photo (dragged left), `-1` for the
 * previous one (dragged right), `0` to settle back. A flick counts only in the direction it travelled.
 */
export function swipeStep(offset: number, velocity: number, width: number): -1 | 0 | 1 {
  const far = width > 0 && Math.abs(offset) >= width * SWIPE_DISTANCE;
  const fast = Math.abs(velocity) >= SWIPE_VELOCITY && Math.sign(velocity) === Math.sign(offset);
  if (offset === 0 || !(far || fast)) return 0;
  return offset < 0 ? 1 : -1;
}

/**
 * `sizes` for a photo in the viewer: as wide as the viewport, unless the viewport is too short
 * for that, when its height (times the photo's ratio) limits it. Portrait photos ask for less.
 */
export function lightboxSizes({ width, height }: { width: number; height: number }): string {
  return `min(100vw, ${String(Math.ceil((width / height) * 100))}vh)`;
}

/** The visible counter, zero-padded to the total's width so it never jitters: "03 / 10". */
export function lightboxCounter(index: number, length: number): string {
  const total = String(length);
  return `${String(index + 1).padStart(total.length, '0')} / ${total}`;
}

/** What screen readers hear when the photo changes: "Photo 3 of 10: a barista at the café counter". */
export function lightboxStatus(index: number, length: number, alt: string): string {
  return `Photo ${String(index + 1)} of ${String(length)}: ${alt}`;
}
