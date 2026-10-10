export interface Point {
  x: number;
  y: number;
}

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const clampUnit = (value: number) => Math.max(-1, Math.min(1, value));

/**
 * How far a magnetic element moves toward the pointer (04 §6, signature moment 7). The pull grows
 * from nothing at the element's centre to `strength` at its edge, and is capped at `strength`
 * in every direction, corners included, so it never drifts more than the token allows.
 */
export function magneticOffset(pointer: Point, box: Box, strength: number): Point {
  if (box.width <= 0 || box.height <= 0) return { x: 0, y: 0 };
  const dx = clampUnit((pointer.x - (box.left + box.width / 2)) / (box.width / 2));
  const dy = clampUnit((pointer.y - (box.top + box.height / 2)) / (box.height / 2));
  const scale = Math.min(1, 1 / Math.hypot(dx, dy)) * strength;
  // Math.hypot(0, 0) is 0, so 1 / 0 is Infinity and min() keeps the full (zero) offset.
  return { x: dx * scale, y: dy * scale };
}
