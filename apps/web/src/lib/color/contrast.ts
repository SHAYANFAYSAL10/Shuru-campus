// WCAG 2.x contrast math, plus a parser for the token file so tests can check what actually ships.

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function parseHex(hex: string): Rgb {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match?.[1]) throw new Error(`Expected a #rrggbb color, got "${hex}"`);
  const value = Number.parseInt(match[1], 16);
  return { r: (value >> 16) & 0xff, g: (value >> 8) & 0xff, b: value & 0xff };
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance, WCAG 2.x definition. */
export function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two `#rrggbb` colors (1–21, order-independent). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(parseHex(a));
  const lb = luminance(parseHex(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG AA minimums. */
export const AA = { text: 4.5, largeText: 3, ui: 3 } as const;

export type Theme = 'light' | 'dark';

export interface TokenSheet {
  /** `paper` → `#f7f4ee` */
  palette: Map<string, string>;
  /** `bg` → `{ light: 'paper', dark: 'night' }` (palette names) */
  semantic: Map<string, Record<Theme, string>>;
  /** Semantic → palette name in the no-`light-dark()` fallback block. */
  fallback: Map<string, string>;
}

const PALETTE_DECL = /--palette-([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi;
const SEMANTIC_DECL =
  /--color-([a-z0-9-]+):\s*light-dark\(\s*var\(--palette-([a-z0-9-]+)\)\s*,\s*var\(--palette-([a-z0-9-]+)\)\s*\)\s*;/gi;
const FALLBACK_DECL = /--color-([a-z0-9-]+):\s*var\(--palette-([a-z0-9-]+)\)\s*;/gi;

/** Reads palette and semantic color tokens out of `tokens.css`. */
export function parseTokenSheet(css: string): TokenSheet {
  const palette = new Map<string, string>();
  for (const [, name, hex] of css.matchAll(PALETTE_DECL)) {
    if (name && hex) palette.set(name, hex.toLowerCase());
  }

  const semantic = new Map<string, Record<Theme, string>>();
  for (const [, name, light, dark] of css.matchAll(SEMANTIC_DECL)) {
    if (name && light && dark) semantic.set(name, { light, dark });
  }

  const fallback = new Map<string, string>();
  const fallbackStart = css.indexOf('@supports not (color: light-dark(');
  if (fallbackStart >= 0) {
    for (const [, name, value] of css.slice(fallbackStart).matchAll(FALLBACK_DECL)) {
      if (name && value) fallback.set(name, value);
    }
  }

  return { palette, semantic, fallback };
}

/** Hex value of a palette color. Throws on unknown names so typos fail loudly. */
export function paletteHex(sheet: TokenSheet, name: string): string {
  const hex = sheet.palette.get(name);
  if (!hex) throw new Error(`Unknown palette token "${name}"`);
  return hex;
}

/** Hex value of a semantic token in a theme. */
export function semanticHex(sheet: TokenSheet, token: string, theme: Theme): string {
  const entry = sheet.semantic.get(token);
  if (!entry) throw new Error(`Unknown semantic token "--color-${token}"`);
  return paletteHex(sheet, entry[theme]);
}
