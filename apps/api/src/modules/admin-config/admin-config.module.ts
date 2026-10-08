import { Module } from '@nestjs/common';

import { AuthModule } from '#src/modules/auth/auth.module.js';
import { PlansModule } from '#src/modules/plans/plans.module.js';
import { PLANS_REPOSITORY, type PlansRepository } from '#src/modules/plans/plans.repository.js';
import { SiteModule } from '#src/modules/site/site.module.js';
import { SITE_REPOSITORY, type SiteRepository } from '#src/modules/site/site.repository.js';

import { AdminConfigController } from './admin-config.controller.js';
import { ADMIN_CONFIG_REPOSITORY } from './admin-config.repository.js';
import { AdminConfigService } from './admin-config.service.js';
import { InMemoryAdminConfigRepository } from './in-memory-admin-config.repository.js';

@Module({
  imports: [AuthModule, SiteModule, PlansModule],
  controllers: [AdminConfigController],
  providers: [
    AdminConfigService,
    {
      provide: ADMIN_CONFIG_REPOSITORY,
      useFactory: (site: SiteRepository, plans: PlansRepository) =>
        new InMemoryAdminConfigRepository(site, plans),
      inject: [SITE_REPOSITORY, PLANS_REPOSITORY],
    },
  ],
})
export class AdminConfigModule {}
