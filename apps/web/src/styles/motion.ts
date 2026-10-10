// Motion tokens (docs/04-design-system.md §6). The only place durations and easings are written
// for JS; tokens.css mirrors the durations for CSS, and motion.test.ts keeps the two equal.

/** Milliseconds. */
export const duration = {
  instant: 100,
  fast: 180,
  base: 320,
  slow: 560,
  story: 900,
  /** Reduced-motion replacement for transforms: a crossfade of at most 150ms. */
  crossfade: 150,
} as const;

export type DurationToken = keyof typeof duration;

/** Seconds, for `motion` transitions. */
export function seconds(token: DurationToken): number {
  return duration[token] / 1000;
}

/** Cubic-bezier control points, matching the --ease-* CSS tokens. */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.55, 0, 1, 0.45],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export type EaseToken = keyof typeof ease;

/** An easing as a CSS `cubic-bezier()`, for the Web Animations API. */
export function cssEase(token: EaseToken): string {
  return `cubic-bezier(${ease[token].join(', ')})`;
}

export const spring = {
  /** Toggles, segmented controls. */
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  /** Magnetic, drag. */
  soft: { type: 'spring', stiffness: 140, damping: 20 },
} as const;

/** List stagger: 50ms per item, never more than 400ms in total. */
export const stagger = { step: 50, max: 400 } as const;

/** Delay in ms for the `index`-th item of a staggered list. */
export function staggerDelay(index: number): number {
  return Math.min(Math.max(index, 0) * stagger.step, stagger.max);
}

export const distance = {
  /** Reveal travel, in px (04 §6: 16–24). */
  reveal: 20,
  /** Furthest a magnetic element moves toward the pointer, in px. */
  magnetic: 6,
} as const;

/**
 * Manifesto statements brighten word by word as they scroll up (05 → Home #2), driven by each
 * statement's own view timeline (`styles/scroll-text.css`, `lib/scroll-text.ts`).
 */
export const scrollText = {
  /**
   * Opacity of a word not yet reached. `fg` at this strength reads like `fg-subtle` and keeps AA
   * contrast for body-size text on `bg-alt` in both themes (scroll-text.test.ts).
   */
  dim: 0.62,
  /**
   * Where the first word starts and the last one finishes, as the statement's `cover` progress
   * (%): from just inside the bottom of the viewport to its middle.
   */
  start: 10,
  end: 50,
  /** How many words' worth of scrolling each word takes, so a few are on their way at once. */
  spread: 3,
} as const;

/** Marquee drift: constant px per second, whatever the content width. */
export const marquee = {
  pxPerSecond: 40,
  /** How long the drift waits, in ms, after someone scrolls or swipes it themselves. */
  resumeAfter: 2000,
} as const;

/** The hero's changing word (04 §6, signature moment 1). */
export const wordCycle = {
  /** How long each word stays, in ms, before the next one slides in. */
  interval: 2800,
} as const;

/** The gallery lightbox (04 §6, signature moment 6). */
export const lightbox = {
  /** How far a photo slides as the next one comes in, as a share of its own width. */
  slide: 0.12,
  /** Scale a photo starts from (and leaves at) when there's no thumbnail on screen to zoom from. */
  settle: 0.96,
} as const;

/** Hover delay before a tooltip opens, in ms. */
export const tooltipDelay = 400;
