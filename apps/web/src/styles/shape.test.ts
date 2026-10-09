// @vitest-environment node
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { radius } from '@/styles/shape';

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

describe('radius tokens', () => {
  it.each(Object.entries(radius))('radius.%s matches --radius-%s in CSS', (name, px) => {
    expect(new RegExp(`--radius-${name}:\\s*([^;]+);`).exec(css)?.[1]?.trim()).toBe(`${px}px`);
  });
});
