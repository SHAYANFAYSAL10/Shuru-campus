import { type Plan, type PlanFeature } from '@campus/contracts';

import { listText, lowerFirst } from '@/lib/list-text';

/**
 * A comparison row groups features that are the same kind of thing under one label, so
 * "Locker" and "Complimentary locker" share a row instead of reading as two different perks.
 * A feature joins the first category that matches its title. Features no category matches
 * become rows of their own, so nothing a plan lists is ever left out of the comparison.
 */
const CATEGORIES = [
  { id: 'workspace', label: 'Workspace', match: /seating|cubicle|dedicated space/i },
  { id: 'meeting-time', label: 'Meeting room time', match: /meeting room/i },
  { id: 'storage', label: 'Storage', match: /locker|cabinet/i },
  { id: 'front-desk', label: 'Front desk', match: /front desk/i },
  { id: 'printing', label: 'Printing', match: /print|copy|scan|fax/i },
  { id: 'screens', label: 'Screens', match: /\btv\b|projector|multimedia/i },
  { id: 'quiet', label: 'Quiet spaces', match: /silent room|timeout zone/i },
  { id: 'food', label: 'Food', match: /snack|lunch/i },
  { id: 'internet', label: 'Internet', match: /internet|wi-?fi/i },
  { id: 'drinks', label: 'Tea & coffee', match: /\btea\b|coffee/i },
] as const;

export interface ComparisonRow {
  id: string;
  /** `category` rows show each plan's own wording; `feature` rows (one feature) just tick. */
  kind: 'category' | 'feature';
  /** "Storage", or a feature's own title when no category covers it. */
  label: string;
  /** Per plan, in the plans' order: what it includes for this row, or `null` for nothing. */
  cells: (PlanFeature[] | null)[];
}

export interface PlanComparison {
  /** Rows where plans differ. */
  rows: ComparisonRow[];
  /** Features every plan includes the same way ("Up to 40 Mbps internet"), said once instead. */
  shared: PlanFeature[];
}

function sameFeatures(a: readonly PlanFeature[], b: readonly PlanFeature[]): boolean {
  return (
    a.length === b.length &&
    a.every((feature, i) => {
      const other = b[i];
      return feature.title === other?.title && feature.detail === other.detail;
    })
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Features × plans for the comparison table (05 → Spaces & Pricing), built from the plans' own
 * feature lists. Rows that every plan fills identically move to `shared`; rows no plan fills are
 * dropped. Pass the plans in display order.
 */
export function comparePlans(plans: readonly Plan[]): PlanComparison {
  const rows = new Map<string, ComparisonRow>();
  const emptyRow = (id: string, label: string, kind: ComparisonRow['kind']): ComparisonRow => ({
    id,
    kind,
    label,
    cells: plans.map(() => null),
  });
  // Categories first, in their order, then uncategorised features as they first appear.
  for (const category of CATEGORIES)
    rows.set(category.id, emptyRow(category.id, category.label, 'category'));

  plans.forEach((plan, column) => {
    for (const feature of plan.features) {
      const category = CATEGORIES.find((c) => c.match.test(feature.title));
      const id = category ? category.id : `feature-${slugify(feature.title)}`;
      let row = rows.get(id);
      if (!row) {
        row = emptyRow(id, feature.title, 'feature');
        rows.set(id, row);
      }
      const cell = row.cells[column];
      if (cell) cell.push(feature);
      else row.cells[column] = [feature];
    }
  });

  const shared: PlanFeature[] = [];
  const differing: ComparisonRow[] = [];
  for (const row of rows.values()) {
    const [first, ...rest] = row.cells;
    if (row.cells.every((cell) => cell === null)) continue;
    if (first && rest.every((cell) => cell !== null && sameFeatures(cell, first))) {
      shared.push(...first);
    } else {
      differing.push(row);
    }
  }
  return { rows: differing, shared };
}

/** "up to 40 Mbps internet and unlimited tea & coffee", to finish "Every plan includes …". */
export function featureList(features: readonly PlanFeature[]): string {
  return listText(features.map(({ title }) => lowerFirst(title)));
}
