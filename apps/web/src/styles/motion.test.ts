// @vitest-environment node
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  cssEase,
  distance,
  duration,
  ease,
  seconds,
  staggerDelay,
  stagger,
  wordCycle,
} from '@/styles/motion';

const read = (file: string) => readFileSync(new URL(file, import.meta.url), 'utf8');
const css = read('./tokens.css') + read('./animations.css');

function cssVar(name: string): string {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(css);
  if (!match?.[1]) throw new Error(`--${name} not found`);
  return match[1].trim();
}

describe('motion tokens', () => {
  it.each(Object.entries(duration))('duration.%s matches --duration-%s in CSS', (name, ms) => {
    expect(cssVar(`duration-${name}`)).toBe(`${ms}ms`);
  });

  it.each([
    ['out', 'ease-out'],
    ['inOut', 'ease-in-out'],
    ['in', 'ease-in'],
  ] as const)('ease.%s matches --%s in CSS', (name, cssName) => {
    expect(cssVar(cssName)).toBe(cssEase(name));
    expect(cssEase(name)).toBe(`cubic-bezier(${ease[name].join(', ')})`);
  });

  it('holds the hero word long enough to read, well past its own slide', () => {
    expect(wordCycle.interval).toBeGreaterThanOrEqual(2 * duration.slow + duration.story);
  });

  it('keeps the reveal distance within 16–24px and in sync with CSS', () => {
    expect(distance.reveal).toBeGreaterThanOrEqual(16);
    expect(distance.reveal).toBeLessThanOrEqual(24);
    expect(cssVar('reveal-distance')).toBe(`${distance.reveal}px`);
  });

  it('keeps reduced-motion crossfades at or under 150ms', () => {
    expect(duration.crossfade).toBeLessThanOrEqual(150);
  });

  it('converts to seconds for motion transitions', () => {
    expect(seconds('slow')).toBe(0.56);
  });

  it('staggers 50ms per item and caps the total at 400ms', () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(3)).toBe(150);
    expect(staggerDelay(100)).toBe(stagger.max);
    expect(staggerDelay(-2)).toBe(0);
  });
});
