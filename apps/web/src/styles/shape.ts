// Radius tokens for JS (docs/04-design-system.md). tokens.css is the source; shape.test.ts keeps
// these equal. Only needed where motion must know a radius in px: a `layout` animation scales
// its element, and motion counter-scales `borderRadius` only when it's given in `style`.

/** Pixels. */
export const radius = {
  sm: 6,
  md: 12,
  lg: 24,
} as const;
