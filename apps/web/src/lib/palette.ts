/**
 * The few palette colors needed where CSS variables can't reach: the `theme-color` meta tag and
 * the generated Open Graph image. tokens.css stays the source of truth; palette.test.ts keeps
 * these values equal to its `--palette-*` declarations.
 */
export const palette = {
  paper: '#f7f4ee',
  paper2: '#efeae0',
  ink: '#16150f',
  ink2: '#55524a',
  line: '#dcd5c8',
  lineStrong: '#857f74',
  marigold: '#e8a33d',
  night: '#12110e',
} as const;

export type PaletteName = keyof typeof palette;
