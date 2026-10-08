import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { type Plan, PLAN_SLUGS } from '@campus/contracts';

import { PublicCache } from '#src/common/cache-control.js';
import { ApiErrors, ApiJson } from '#src/common/openapi.js';

import { PlansService } from './plans.service.js';

@Controller('plans')
@PublicCache()
@ApiTags('plans')
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @Get()
  @ApiJson(200, 'Plan', { collection: true, description: 'Ordered by `order`.' })
  async list(): Promise<{ items: Plan[] }> {
    return { items: await this.plans.list() };
  }

  // Any slug string is accepted: an unknown one is a missing resource (404), not bad input.
  @Get(':slug')
  @ApiParam({ name: 'slug', enum: PLAN_SLUGS })
  @ApiJson(200, 'Plan')
  @ApiErrors(404)
  get(@Param('slug') slug: string): Promise<Plan> {
    return this.plans.get(slug);
  }
}
