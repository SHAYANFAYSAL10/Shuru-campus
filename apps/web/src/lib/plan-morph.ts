// Plan card → detail (docs/04-design-system.md §6, signature moment 3): a plan card's photo grows
// into the photo on the plan's own page. Browsers with the View Transitions API morph it natively
// (React's <ViewTransition>, activated by the PLAN_OPEN transition type the card's link passes).
// Elsewhere it's an explicit FLIP: the card's link records where its photo is when it's clicked,
// and the plan page's photo flies from there when it mounts. (By the time the card unmounts, the
// router has already hidden the old page, so there's nothing left to measure.)

import { type LineBox } from '@/lib/begin-line-handoff';

/** The transition type a plan card's link adds to its navigation. */
export const PLAN_OPEN = 'plan-open';

/** The view-transition-class of the morphing photo (`styles/plan-morph.css`). */
export const PLAN_MORPH_CLASS = 'plan-morph';

/** The view-transition-class of the other cards' photos, which fade out with the page. */
export const PLAN_LEAVE_CLASS = 'plan-leave';

// Mark a plan card and its photo, for the card's link to find the photo (the fallback).
export const PLAN_CARD_ATTRIBUTE = 'data-plan-card';
export const PLAN_SOURCE_ATTRIBUTE = 'data-plan-morph-source';

/** Spread on a plan card's root. */
export const planCardAttributes = { [PLAN_CARD_ATTRIBUTE]: '' } as const;

/** The view-transition-name a plan's photo shares between its card and its page. */
export function planPhotoName(slug: string): string {
  return `plan-photo-${slug}`;
}

export interface MorphSource {
  box: LineBox;
  /** The card photo's corner radius, in px. */
  radius: number;
}

/**
 * How long a click's record of its card waits for the plan page, in ms. Long enough for a slow
 * navigation; it's taken by that plan's page only, once.
 */
export const MORPH_TTL = 10_000;

let pending: { slug: string; at: number; source: MorphSource } | null = null;

/** Keeps where a followed card's photo is, for that plan page's photo to fly from. */
export function recordMorph(slug: string, source: MorphSource, at: number): void {
  pending = { slug, at, source };
}

/** Takes the recorded photo once, if it's `slug`'s and was recorded within `MORPH_TTL` of `at`. */
export function takeMorph(slug: string, at: number): MorphSource | null {
  const record = pending;
  pending = null;
  if (record?.slug !== slug || at < record.at || at - record.at > MORPH_TTL) return null;
  return record.source;
}

/** Where the flying photo starts, relative to where it lands, scaled from its top-left. */
export interface MorphTransform {
  x: number;
  y: number;
  scale: number;
  /** `clip-path: inset()` in the landed photo's own px, cropping it to the card's shape. */
  insetX: number;
  insetY: number;
}

/**
 * The transform that lays a photo landed at `to` over the card photo at `from`. The photo scales
 * evenly (never stretched) until it covers the card's box, and is cropped to it, centered, the
 * way `object-fit: cover` crops the card. `null` when either box has no size.
 */
export function coverTransform(from: LineBox, to: LineBox): MorphTransform | null {
  if (from.width <= 0 || from.height <= 0 || to.width <= 0 || to.height <= 0) return null;
  const scale = Math.max(from.width / to.width, from.height / to.height);
  const insetX = (to.width - from.width / scale) / 2;
  const insetY = (to.height - from.height / scale) / 2;
  return {
    x: from.left - to.left - insetX * scale,
    y: from.top - to.top - insetY * scale,
    scale,
    insetX,
    insetY,
  };
}
