import { type AdminConfig } from '@campus/contracts';

import { type PlansRepository } from '#src/modules/plans/plans.repository.js';
import { type SiteRepository } from '#src/modules/site/site.repository.js';

import {
  type AdminConfigRepository,
  type ConfigChange,
  NotPersistedError,
} from './admin-config.repository.js';

/**
 * Phase 1: the console sees exactly what the public site serves (the same repositories),
 * and nothing can be saved.
 */
export class InMemoryAdminConfigRepository implements AdminConfigRepository {
  /** The seed data's age: it was loaded at boot and never changes. */
  private readonly updatedAt = new Date().toISOString();

  constructor(
    private readonly site: SiteRepository,
    private readonly plans: PlansRepository,
  ) {}

  async get(): Promise<AdminConfig> {
    const [site, plans] = await Promise.all([this.site.get(), this.plans.findAll()]);
    return {
      site,
      plans,
      meta: { dataSource: 'memory', editable: false, updatedAt: this.updatedAt },
    };
  }

  update(change: ConfigChange): Promise<void> {
    return Promise.reject(new NotPersistedError(change.kind));
  }
}
