import { type Plan, PlanList, plansSeed } from '@campus/contracts';

import { validateSeed } from '#src/common/seed.js';

import { type PlansRepository } from './plans.repository.js';

/** Phase 1: the contracts seed, validated at boot. Reads hand out copies. */
export class InMemoryPlansRepository implements PlansRepository {
  private readonly plans: Plan[];

  constructor(seed: unknown = plansSeed) {
    this.plans = validateSeed('plans', PlanList, seed).toSorted((a, b) => a.order - b.order);
  }

  findAll(): Promise<Plan[]> {
    return Promise.resolve(structuredClone(this.plans));
  }

  findBySlug(slug: string): Promise<Plan | null> {
    const plan = this.plans.find((p) => p.slug === slug);
    return Promise.resolve(plan ? structuredClone(plan) : null);
  }
}
