import { Module } from '@nestjs/common';

import { InMemoryPlansRepository } from './in-memory-plans.repository.js';
import { PlansController } from './plans.controller.js';
import { PLANS_REPOSITORY } from './plans.repository.js';
import { PlansService } from './plans.service.js';

@Module({
  controllers: [PlansController],
  providers: [
    PlansService,
    { provide: PLANS_REPOSITORY, useFactory: () => new InMemoryPlansRepository() },
  ],
  // Admin config (T2.9) reads the same plans.
  exports: [PLANS_REPOSITORY],
})
export class PlansModule {}
