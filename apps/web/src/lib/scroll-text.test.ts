// @vitest-environment node
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  AA,
  contrastRatio,
  parseHex,
  parseTokenSheet,
  semanticHex,
  type Theme,
} from '@/lib/color/contrast';
import { scrollWords } from '@/lib/scroll-text';
import { scrollText } from '@/styles/motion';

const sheet = parseTokenSheet(
  readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8'),
);

/** `fg` at `alpha` over `bg`, as the browser composites it. */
function blend(fg: string, bg: string, alpha: number): string {
  const f = parseHex(fg);
  const b = parseHex(bg);
  const mix = (a: number, z: number) =>
    Math.round(a * alpha + z * (1 - alpha))
      .toString(16)
      .padStart(2, '0');
  return `#${mix(f.r, b.r)}${mix(f.g, b.g)}${mix(f.b, b.b)}`;
}

describe('scrollWords', () => {
  const words = scrollWords([
    { text: 'Empower', em: true },
    { text: 'your business  with a head-start.' },
  ]);

  it('splits the statement into words, keeping the emphasis', () => {
    expect(words.map((w) => w.word)).toEqual([
      'Empower',
      'your',
      'business',
      'with',
      'a',
      'head-start.',
    ]);
    expect(words.map((w) => w.em)).toEqual([true, false, false, false, false, false]);
  });

  it('brightens the words in reading order, within the statement’s range', () => {
    expect(words[0]?.from).toBe(scrollText.start);
    expect(words.at(-1)?.to).toBe(scrollText.end);
    for (const [i, word] of words.entries()) {
      expect(word.to).toBeGreaterThan(word.from);
      expect(word.to).toBeLessThanOrEqual(scrollText.end);
      if (i > 0) expect(word.from).toBeGreaterThan(words[i - 1]?.from ?? Infinity);
    }
  });

  it('overlaps neighbours, so a few words are on their way at once', () => {
    const [first, second] = words;
    expect(second?.from).toBeLessThan(first?.to ?? 0);
  });

  it('gives a single word the whole range', () => {
    expect(scrollWords([{ text: 'Enrich' }])).toEqual([
      { word: 'Enrich', em: false, from: scrollText.start, to: scrollText.end },
    ]);
  });

  it('has nothing to brighten in an empty statement', () => {
    expect(scrollWords([{ text: '  ' }])).toEqual([]);
  });
});

describe('scrollText.dim', () => {
  it.each(['light', 'dark'] satisfies Theme[])(
    'keeps words not yet reached at AA contrast for body text on bg-alt (%s)',
    (theme) => {
      const bg = semanticHex(sheet, 'bg-alt', theme);
      const dimmed = blend(semanticHex(sheet, 'fg', theme), bg, scrollText.dim);
      expect(contrastRatio(dimmed, bg)).toBeGreaterThanOrEqual(AA.text);
    },
  );

  it('still reads as a change: well short of full strength', () => {
    expect(scrollText.dim).toBeLessThanOrEqual(0.7);
  });
});
