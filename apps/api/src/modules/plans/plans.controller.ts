import { Controller, Get, Param } from '@nestjs/common';

import { type Plan } from '@campus/contracts';

import { PublicCache } from '#src/common/cache-control.js';

import { PlansService } from './plans.service.js';

@Controller('plans')
@PublicCache()
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @Get()
  async list(): Promise<{ items: Plan[] }> {
    return { items: await this.plans.list() };
  }

  // Any slug string is accepted: an unknown one is a missing resource (404), not bad input.
  @Get(':slug')
  get(@Param('slug') slug: string): Promise<Plan> {
    return this.plans.get(slug);
  }
}
