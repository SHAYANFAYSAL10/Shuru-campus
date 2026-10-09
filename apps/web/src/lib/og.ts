/** Open Graph image size: the 1.91:1 card every major network crops to. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** Inner padding of the card, in px. */
export const OG_PADDING = 80;

/**
 * Font size for the brand name on the card, in px: as large as fits on one line, shrinking for
 * longer names (and wrapping onto a second line only below the floor). Fraunces averages about
 * half an em per character.
 */
export function ogTitleSize(name: string, width: number = OG_SIZE.width - 2 * OG_PADDING): number {
  const max = 136;
  const min = 72;
  const fit = Math.floor(width / (Math.max(name.trim().length, 1) * 0.5));
  return Math.max(min, Math.min(max, fit));
}
