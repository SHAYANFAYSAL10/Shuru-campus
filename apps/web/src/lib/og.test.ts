import { describe, expect, it } from 'vitest';

import { ogTitleSize } from '@/lib/og';

describe('ogTitleSize', () => {
  it('keeps short names at full size', () => {
    expect(ogTitleSize('Acme')).toBe(136);
  });

  it('shrinks longer names to fit one line', () => {
    const size = ogTitleSize('Acme Works Coworking Hub');
    expect(size).toBeLessThan(136);
    expect(size * 0.5 * 'Acme Works Coworking Hub'.length).toBeLessThanOrEqual(1040);
  });

  it('never goes below the floor, even for the longest names', () => {
    expect(ogTitleSize('x'.repeat(60))).toBe(72);
  });
});
