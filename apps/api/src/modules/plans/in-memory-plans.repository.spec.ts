import { plansSeed } from '@campus/contracts';

import { SeedError } from '#src/common/seed.js';

import { InMemoryPlansRepository } from './in-memory-plans.repository.js';

describe('InMemoryPlansRepository', () => {
  it('returns plans ordered by `order`, whatever the seed order', async () => {
    const repo = new InMemoryPlansRepository(plansSeed.toReversed());
    const plans = await repo.findAll();
    expect(plans.map((p) => p.order)).toEqual(
      plansSeed.map((p) => p.order).toSorted((a, b) => a - b),
    );
  });

  it('finds a plan by slug, or null', async () => {
    const repo = new InMemoryPlansRepository();
    expect((await repo.findBySlug('hot-desk'))?.slug).toBe('hot-desk');
    expect(await repo.findBySlug('penthouse')).toBeNull();
  });

  it('rejects duplicate slugs and fractional prices at construction', () => {
    const [first] = plansSeed;
    expect(() => new InMemoryPlansRepository([first, first])).toThrow(/slugs must be unique/);
    expect(
      () =>
        new InMemoryPlansRepository([
          { ...first, rates: [{ id: 'day', amountBdt: 99.5, unit: 'day' }] },
        ]),
    ).toThrow(SeedError);
  });

  it('hands out copies', async () => {
    const repo = new InMemoryPlansRepository();
    const plan = await repo.findBySlug('hot-desk');
    if (plan) plan.name = 'Changed';
    expect((await repo.findBySlug('hot-desk'))?.name).not.toBe('Changed');
  });
});
