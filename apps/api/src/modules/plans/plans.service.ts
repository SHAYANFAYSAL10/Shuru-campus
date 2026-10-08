import { Inject, Injectable } from '@nestjs/common';

import { type Plan } from '@campus/contracts';

import { ApiException } from '#src/common/api-exception.js';

import { PLANS_REPOSITORY, type PlansRepository } from './plans.repository.js';

@Injectable()
export class PlansService {
  constructor(@Inject(PLANS_REPOSITORY) private readonly plans: PlansRepository) {}

  list(): Promise<Plan[]> {
    return this.plans.findAll();
  }

  /** Throws `404 NOT_FOUND` for an unknown slug. */
  async get(slug: string): Promise<Plan> {
    const plan = await this.plans.findBySlug(slug);
    if (!plan) throw new ApiException('NOT_FOUND', "We couldn't find that plan.");
    return plan;
  }
}
