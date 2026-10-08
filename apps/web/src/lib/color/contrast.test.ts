// @vitest-environment node
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  AA,
  contrastRatio,
  luminance,
  paletteHex,
  parseHex,
  parseTokenSheet,
  semanticHex,
  type Theme,
} from '@/lib/color/contrast';

const css = readFileSync(new URL('../../styles/tokens.css', import.meta.url), 'utf8');
const sheet = parseTokenSheet(css);

type Use = 'text' | 'ui' | 'never';
const MIN: Record<Exclude<Use, 'never'>, number> = { text: AA.text, ui: AA.ui };

// docs/10-design-guidelines.md → A4, row for row. [foreground, background, documented ratio, use]
const MATRIX: [string, string, number, Use][] = [
  // Light
  ['ink', 'paper', 16.66, 'text'],
  ['ink-2', 'paper', 7.11, 'text'],
  ['ink-2', 'paper-2', 6.51, 'text'],
  ['ink-3', 'paper', 5.13, 'text'],
  ['ink-3', 'paper-2', 4.7, 'text'],
  ['ink-3', 'white', 5.63, 'text'],
  ['marigold-ink', 'paper', 5.39, 'text'],
  ['marigold-ink', 'white', 5.92, 'text'],
  ['marigold-ink', 'paper-2', 4.93, 'text'],
  ['marigold-ink', 'marigold-tint', 5.04, 'text'],
  ['ink', 'marigold', 8.48, 'text'],
  ['ink', 'marigold-tint', 15.59, 'text'],
  ['ink', 'lake-tint', 15.69, 'text'],
  ['lake', 'paper', 8.51, 'text'],
  ['lake', 'white', 9.35, 'text'],
  ['paper', 'lake', 8.51, 'text'],
  ['lake', 'lake-tint', 8.02, 'text'],
  ['success', 'paper', 5.85, 'text'],
  ['success', 'paper-2', 5.35, 'text'],
  ['success', 'white', 6.42, 'text'],
  ['danger', 'paper', 5.95, 'text'],
  ['danger', 'paper-2', 5.45, 'text'],
  ['danger', 'white', 6.54, 'text'],
  ['line-strong', 'paper', 3.62, 'ui'],
  ['line-strong', 'paper-2', 3.31, 'ui'],
  ['line-strong', 'white', 3.97, 'ui'],
  ['marigold', 'lake', 4.33, 'ui'],
  ['marigold', 'paper', 1.96, 'never'],
  ['line', 'paper', 1.33, 'never'],
  // Dark
  ['parchment', 'night', 16.46, 'text'],
  ['parchment', 'night-2', 15.18, 'text'],
  ['parchment-2', 'night', 9.05, 'text'],
  ['parchment-3', 'night', 5.43, 'text'],
  ['parchment-3', 'night-2', 5.01, 'text'],
  ['parchment-3', 'night-3', 5.63, 'text'],
  ['sun', 'night', 10.15, 'text'],
  ['sun', 'night-2', 9.36, 'text'],
  ['sun', 'night-3', 10.51, 'text'],
  ['ink', 'sun', 9.83, 'text'],
  ['sun', 'sun-tint', 7.28, 'text'],
  ['parchment', 'sun-tint', 11.81, 'text'],
  ['lake-light', 'night', 8.44, 'text'],
  ['lake-light', 'night-2', 7.78, 'text'],
  ['parchment', 'lake-night', 10.02, 'text'],
  ['parchment', 'lake', 8.15, 'text'],
  ['success-dark', 'night-2', 7.89, 'text'],
  ['danger-dark', 'night', 7.63, 'text'],
  ['danger-dark', 'night-2', 7.04, 'text'],
  ['night-line-strong', 'night', 3.92, 'ui'],
  ['night-line-strong', 'night-3', 4.05, 'ui'],
  ['night-line-strong', 'night-2', 3.61, 'ui'],
  ['sun', 'lake', 5.02, 'ui'],
  ['night-line', 'night', 1.35, 'never'],
  ['lake', 'night', 2.02, 'never'],
];

// Every semantic pairing components are allowed to use (A5 rule 2), checked in both themes.
const SEMANTIC_PAIRS: [fg: string, bg: string, use: Exclude<Use, 'never'>][] = [
  ...['fg', 'fg-muted', 'fg-subtle'].flatMap((fg) =>
    ['bg', 'bg-alt', 'surface'].map((bg) => [fg, bg, 'text'] as [string, string, 'text']),
  ),
  ['accent-text', 'bg', 'text'],
  ['accent-text', 'bg-alt', 'text'],
  ['accent-text', 'surface', 'text'],
  ['accent-text', 'accent-subtle', 'text'],
  ['fg', 'accent-subtle', 'text'],
  ['on-accent', 'accent', 'text'],
  ['brand', 'bg', 'text'],
  ['brand', 'surface', 'text'],
  ['on-brand', 'brand-surface', 'text'],
  ['brand-surface', 'on-brand', 'text'],
  ['fg', 'info-subtle', 'text'],
  ['bg', 'fg', 'text'],
  ['success', 'bg', 'text'],
  ['success', 'surface', 'text'],
  ['danger', 'bg', 'text'],
  ['danger', 'surface', 'text'],
  ['border-strong', 'bg', 'ui'],
  ['border-strong', 'bg-alt', 'ui'],
  ['border-strong', 'surface', 'ui'],
  ['focus', 'bg', 'ui'],
  ['focus', 'bg-alt', 'ui'],
  ['focus', 'surface', 'ui'],
  ['accent', 'brand-surface', 'ui'],
];

describe('contrast math', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
    expect(contrastRatio('#ffffff', '#000000')).toBe(contrastRatio('#000000', '#ffffff'));
    expect(luminance(parseHex('#ffffff'))).toBeCloseTo(1, 5);
  });

  it('rejects malformed colors and unknown tokens', () => {
    expect(() => parseHex('#fff')).toThrow(/#rrggbb/);
    expect(() => paletteHex(sheet, 'neon')).toThrow(/Unknown palette/);
    expect(() => semanticHex(sheet, 'neon', 'light')).toThrow(/Unknown semantic/);
  });
});

describe('A4 contrast matrix (docs/10-design-guidelines.md)', () => {
  it.each(MATRIX)('%s on %s is %f', (fg, bg, documented, use) => {
    const ratio = contrastRatio(paletteHex(sheet, fg), paletteHex(sheet, bg));
    // The documented figure must stay true to the shipped hex values.
    expect(ratio).toBeCloseTo(documented, 2);
    if (use === 'never') expect(ratio).toBeLessThan(AA.ui);
    else expect(ratio).toBeGreaterThanOrEqual(MIN[use]);
  });
});

describe.each<Theme>(['light', 'dark'])('semantic pairs in %s', (theme) => {
  it.each(SEMANTIC_PAIRS)('%s on %s', (fg, bg, use) => {
    const ratio = contrastRatio(semanticHex(sheet, fg, theme), semanticHex(sheet, bg, theme));
    expect(ratio).toBeGreaterThanOrEqual(MIN[use]);
  });
});

describe('token sheet', () => {
  it('maps every semantic color from A3 in both themes', () => {
    const a3 = [
      'bg',
      'bg-alt',
      'surface',
      'fg',
      'fg-muted',
      'fg-subtle',
      'border',
      'border-strong',
      'accent',
      'on-accent',
      'accent-text',
      'accent-subtle',
      'brand',
      'brand-surface',
      'on-brand',
      'info-subtle',
      'focus',
      'success',
      'danger',
    ];
    for (const token of a3) {
      expect(sheet.semantic.has(token), `--color-${token}`).toBe(true);
    }
  });

  it('declares the theme pairs on every theme scope, so nested .light/.dark subtrees re-resolve', () => {
    // Custom properties resolve where they're declared: a pair declared on :root alone would be
    // inherited, already resolved, by a nested .dark panel (and by polyfilled light-dark()).
    expect(css).toMatch(/:root,\s*\.light,\s*\.dark\s*\{\s*--color-bg: light-dark\(/);
  });

  it('keeps the no-light-dark() fallback identical to the light theme', () => {
    for (const [token, { light }] of sheet.semantic) {
      expect(sheet.fallback.get(token), `--color-${token}`).toBe(light);
    }
  });

  it('never uses pure black or white as a page background or text color (A5)', () => {
    for (const token of ['bg', 'fg']) {
      for (const theme of ['light', 'dark'] as const) {
        expect(['#000000', '#ffffff']).not.toContain(semanticHex(sheet, token, theme));
      }
    }
  });
});
