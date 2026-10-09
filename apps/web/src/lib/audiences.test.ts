import { describe, expect, it } from 'vitest';

import { plansSeed } from '@campus/contracts';

import { AUDIENCES, audienceTiles } from '@/lib/audiences';

describe('AUDIENCES', () => {
  it('points every audience at a different seed plan', () => {
    const slugs = AUDIENCES.map((a) => a.planSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(plansSeed.some((p) => p.slug === slug)).toBe(true);
  });
});

describe('audienceTiles', () => {
  it('links each audience to its plan with the plan’s lowest rate', () => {
    const [first] = audienceTiles(plansSeed);
    expect(first).toMatchObject({
      title: 'Freelancers & travelling professionals',
      href: '/spaces/hot-desk',
      cta: 'See Hot Desk pricing',
      from: { amountBdt: 100, unit: 'hour' },
    });
  });

  it('keeps the audiences in order', () => {
    expect(audienceTiles(plansSeed).map((t) => t.id)).toEqual(AUDIENCES.map((a) => a.id));
  });

  it('falls back to every plan, without a price, when the plans failed to load', () => {
    for (const tile of audienceTiles(null)) {
      expect(tile).toMatchObject({ href: '/spaces', cta: 'See spaces & pricing' });
      expect(tile.from).toBeUndefined();
    }
  });

  it('falls back for a plan that is missing from the list', () => {
    const tiles = audienceTiles(plansSeed.filter((p) => p.slug !== 'seminar-room'));
    expect(tiles.find((t) => t.id === 'events')).toMatchObject({ href: '/spaces' });
    expect(tiles.find((t) => t.id === 'teams')).toMatchObject({ href: '/spaces/private-office' });
  });
});
