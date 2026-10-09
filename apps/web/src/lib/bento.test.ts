import { describe, expect, it } from 'vitest';

import { type BentoSpan, bentoSpans } from '@/lib/bento';

const SIZE: Record<BentoSpan, { cols: number; rows: number }> = {
  feature: { cols: 2, rows: 2 },
  wide: { cols: 2, rows: 1 },
  single: { cols: 1, rows: 1 },
};

/** CSS grid auto-placement with `grid-auto-flow: dense`: each tile takes the first slot it fits. */
function pack(spans: BentoSpan[], columns: number): boolean[][] {
  const grid: boolean[][] = [];
  const free = (row: number, col: number) => !grid[row]?.[col];
  for (const span of spans) {
    const { cols, rows } = SIZE[span];
    let placed = false;
    for (let row = 0; !placed; row++) {
      for (let col = 0; col + cols <= columns && !placed; col++) {
        const fits = Array.from({ length: rows }).every((_, r) =>
          Array.from({ length: cols }).every((__, c) => free(row + r, col + c)),
        );
        if (!fits) continue;
        for (let r = 0; r < rows; r++) {
          grid[row + r] ??= Array.from({ length: columns }, () => false);
          for (let c = 0; c < cols; c++) grid[row + r]![col + c] = true;
        }
        placed = true;
      }
    }
  }
  return grid;
}

describe('bentoSpans', () => {
  it('leads with the feature, then the wide tiles', () => {
    expect(bentoSpans(11, 4)).toEqual([
      'feature',
      'wide',
      'wide',
      ...Array.from({ length: 8 }, () => 'single'),
    ]);
    expect(bentoSpans(11, 3).slice(0, 3)).toEqual(['feature', 'wide', 'single']);
  });

  it.each([3, 4])('closes every grid of %i columns with no holes', (columns) => {
    for (let count = columns; count <= 24; count++) {
      const rows = pack(bentoSpans(count, columns), columns);
      expect(rows.flat().every(Boolean), `${String(count)} tiles`).toBe(true);
    }
  });

  it('drops the feature when it would leave holes', () => {
    expect(bentoSpans(4, 3)).toEqual(['wide', 'wide', 'single', 'single']);
  });

  it('falls back to single cells when nothing closes the grid', () => {
    expect(bentoSpans(0, 4)).toEqual([]);
    expect(bentoSpans(1, 4)).toEqual(['single']);
    expect(bentoSpans(2, 4)).toEqual(['single', 'single']);
  });

  it('never makes a feature in a single column', () => {
    expect(bentoSpans(3, 1)).toEqual(['single', 'single', 'single']);
  });
});
