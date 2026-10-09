import { describe, expect, it } from 'vitest';

import { plansSeed, type Plan } from '@campus/contracts';

import { comparePlans, featureList } from '@/lib/plan-comparison';
import { sortPlans } from '@/lib/plans';

const plans = sortPlans(plansSeed);

function plan(slug: Plan['slug'], features: Plan['features']): Plan {
  const base = plansSeed.find((p) => p.slug === slug);
  if (!base) throw new Error(`seed has no ${slug}`);
  return { ...base, features };
}

describe('comparePlans', () => {
  it('says what every plan includes once, instead of as a row', () => {
    const { shared, rows } = comparePlans(plans);
    expect(shared.map((f) => f.title)).toEqual([
      'Up to 40 Mbps internet',
      'Unlimited tea & coffee',
    ]);
    expect(rows.map((row) => row.id)).not.toContain('internet');
  });

  it('groups the same kind of feature under one row', () => {
    const { rows } = comparePlans(plans);
    const storage = rows.find((row) => row.id === 'storage');
    expect(storage?.label).toBe('Storage');
    // Hot Desk, Business, Executive, Private Office, Meeting Room, Seminar Room.
    expect(storage?.cells.map((cell) => cell?.map((f) => f.title) ?? null)).toEqual([
      null,
      ['Locker'],
      ['Cabinet', 'Complimentary locker'],
      ['Complimentary cabinet'],
      null,
      null,
    ]);
  });

  it('keeps feature details', () => {
    const { rows } = comparePlans(plans);
    const meeting = rows.find((row) => row.id === 'meeting-time');
    expect(meeting?.cells[1]).toEqual([{ title: '1 hour free meeting room', detail: 'Per month' }]);
  });

  it('gives features no category covers a row of their own', () => {
    const { rows } = comparePlans([
      plan('hot-desk', [{ title: 'Phone booth' }]),
      plan('meeting-room', []),
    ]);
    expect(rows).toEqual([
      {
        id: 'feature-phone-booth',
        kind: 'feature',
        label: 'Phone booth',
        cells: [[{ title: 'Phone booth' }], null],
      },
    ]);
  });

  it('keeps a row that every plan fills differently', () => {
    const { rows, shared } = comparePlans([
      plan('hot-desk', [{ title: 'Print, copy & scan' }]),
      plan('private-office', [{ title: 'Print, fax & scan' }]),
    ]);
    expect(shared).toEqual([]);
    expect(rows.map((row) => row.id)).toEqual(['printing']);
  });

  it('handles no plans', () => {
    expect(comparePlans([])).toEqual({ rows: [], shared: [] });
  });
});

describe('featureList', () => {
  it('joins titles into running text', () => {
    expect(featureList([{ title: 'Up to 40 Mbps internet' }])).toBe('up to 40 Mbps internet');
    expect(featureList([{ title: 'Locker' }, { title: 'Cabinet' }])).toBe('locker and cabinet');
    expect(featureList([{ title: 'A' }, { title: 'B' }, { title: 'C' }])).toBe('a, b and c');
  });
});
