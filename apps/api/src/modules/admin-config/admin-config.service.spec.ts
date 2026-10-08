import { type AdminConfig, defaultBrand, plansSeed } from '@campus/contracts';

import { InMemoryPlansRepository } from '#src/modules/plans/in-memory-plans.repository.js';
import { InMemorySiteRepository } from '#src/modules/site/in-memory-site.repository.js';

import { type AdminConfigRepository, NotPersistedError } from './admin-config.repository.js';
import { AdminConfigService, PREVIEW_SAVE_MESSAGE } from './admin-config.service.js';
import { InMemoryAdminConfigRepository } from './in-memory-admin-config.repository.js';

const [hotDesk] = plansSeed;
if (!hotDesk) throw new Error('Seed has no plans');

function setup() {
  const site = new InMemorySiteRepository(defaultBrand);
  const plans = new InMemoryPlansRepository();
  const repo = new InMemoryAdminConfigRepository(site, plans);
  return { site, plans, repo, service: new AdminConfigService(repo, plans) };
}

describe('InMemoryAdminConfigRepository', () => {
  it('reports what the public repositories serve, as read-only memory data', async () => {
    const { site, plans, repo } = setup();
    const config = await repo.get();
    expect(config.site).toEqual(await site.get());
    expect(config.plans).toEqual(await plans.findAll());
    expect(config.meta).toMatchObject({ dataSource: 'memory', editable: false });
  });

  it('refuses every update with NotPersistedError', async () => {
    const { repo } = setup();
    await expect(repo.update({ kind: 'plan', plan: hotDesk })).rejects.toBeInstanceOf(
      NotPersistedError,
    );
  });
});

describe('AdminConfigService.save', () => {
  it('returns persisted: false and changes nothing in Phase 1', async () => {
    const { repo, service } = setup();
    const before = await repo.get();
    const result = await service.save({ kind: 'plan', plan: { ...hotDesk, name: 'Renamed' } });
    expect(result).toEqual({ persisted: false, validated: true, message: PREVIEW_SAVE_MESSAGE });
    expect(await repo.get()).toEqual(before);
  });

  it('returns persisted: true when the repository saves (Phase 2)', async () => {
    const { plans } = setup();
    const saving: AdminConfigRepository = {
      get: () => Promise.reject(new Error('unused')),
      update: () => Promise.resolve(),
    };
    const result = await new AdminConfigService(saving, plans).save({
      kind: 'plan',
      plan: hotDesk,
    });
    expect(result.persisted).toBe(true);
  });

  it('rethrows unexpected repository errors', async () => {
    const { plans } = setup();
    const failing: AdminConfigRepository = {
      get: () => Promise.resolve({} as AdminConfig),
      update: () => Promise.reject(new Error('disk on fire')),
    };
    await expect(
      new AdminConfigService(failing, plans).save({ kind: 'plan', plan: hotDesk }),
    ).rejects.toThrow('disk on fire');
  });

  it('rejects a plan that does not exist with NOT_FOUND', async () => {
    const plans = new InMemoryPlansRepository(plansSeed.filter((p) => p.slug !== 'hot-desk'));
    const repo = new InMemoryAdminConfigRepository(new InMemorySiteRepository(defaultBrand), plans);
    await expect(
      new AdminConfigService(repo, plans).save({ kind: 'plan', plan: hotDesk }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
