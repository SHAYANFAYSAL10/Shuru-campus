// @vitest-environment node
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { paletteHex, parseTokenSheet } from '@/lib/color/contrast';
import { palette, type PaletteName } from '@/lib/palette';

const sheet = parseTokenSheet(
  readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8'),
);

/** `paper2` → `paper-2`, `lineStrong` → `line-strong`. */
function tokenName(name: PaletteName): string {
  return name.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();
}

describe('palette', () => {
  it.each(Object.keys(palette) as PaletteName[])('%s matches tokens.css', (name) => {
    expect(palette[name]).toBe(paletteHex(sheet, tokenName(name)));
  });
});
