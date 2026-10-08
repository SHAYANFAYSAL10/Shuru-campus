/** A tile's footprint in a bento grid. */
export type BentoSpan = 'feature' | 'wide' | 'single';

const FOOTPRINT: Record<BentoSpan, { cols: number; rows: number }> = {
  feature: { cols: 2, rows: 2 },
  wide: { cols: 2, rows: 1 },
  single: { cols: 1, rows: 1 },
};

/**
 * Whether `spans` fill a `columns`-wide grid with no holes under `grid-auto-flow: dense`, which
 * puts each tile in the first slot (row by row, from the top) where it fits.
 */
function fillsGrid(spans: readonly BentoSpan[], columns: number): boolean {
  const taken: boolean[][] = [];
  const isFree = (row: number, col: number) => taken[row]?.[col] !== true;
  let cells = 0;

  for (const span of spans) {
    const { cols, rows } = FOOTPRINT[span];
    if (cols > columns) return false;
    cells += cols * rows;
    let placed = false;
    for (let row = 0; !placed; row++) {
      for (let col = 0; col + cols <= columns && !placed; col++) {
        let fits = true;
        for (let r = 0; r < rows && fits; r++) {
          for (let c = 0; c < cols && fits; c++) fits = isFree(row + r, col + c);
        }
        if (!fits) continue;
        for (let r = 0; r < rows; r++) {
          const line = (taken[row + r] ??= []);
          for (let c = 0; c < cols; c++) line[col + c] = true;
        }
        placed = true;
      }
    }
  }
  // Every row used is full exactly when the cells add up to whole rows.
  return cells === taken.length * columns;
}

function layout(count: number, feature: boolean, wide: number): BentoSpan[] {
  return Array.from({ length: count }, (_, i) => {
    if (feature && i === 0) return 'feature';
    const position = feature ? i : i + 1;
    return position <= wide ? 'wide' : 'single';
  });
}

/**
 * Footprints for `count` tiles in a `columns`-wide bento (05 → Home #5): the first tile is the
 * 2×2 feature and the next few are 2 wide, with as few wide tiles as it takes for the grid to
 * close with no holes (laid out with `grid-auto-flow: dense`). If no such layout exists (too few
 * tiles), it drops the feature, and failing that, every tile is a single cell.
 */
export function bentoSpans(count: number, columns: number): BentoSpan[] {
  if (count <= 0) return [];
  for (const feature of [true, false]) {
    for (let wide = 0; wide < count; wide++) {
      const spans = layout(count, feature, wide);
      if (fillsGrid(spans, columns)) return spans;
    }
  }
  return layout(count, false, 0);
}
