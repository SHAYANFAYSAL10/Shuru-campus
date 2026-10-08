import { Module } from '@nestjs/common';

import { APP_CONFIG, type AppConfig } from '#src/config/app-config.js';

import {
  InMemoryAmenitiesRepository,
  InMemoryGalleryRepository,
  InMemorySiteRepository,
} from './in-memory-site.repository.js';
import { SiteController } from './site.controller.js';
import { AMENITIES_REPOSITORY, GALLERY_REPOSITORY, SITE_REPOSITORY } from './site.repository.js';
import { SiteService } from './site.service.js';

@Module({
  controllers: [SiteController],
  providers: [
    SiteService,
    {
      provide: SITE_REPOSITORY,
      useFactory: (config: AppConfig) => new InMemorySiteRepository(config.brand),
      inject: [APP_CONFIG],
    },
    { provide: AMENITIES_REPOSITORY, useFactory: () => new InMemoryAmenitiesRepository() },
    { provide: GALLERY_REPOSITORY, useFactory: () => new InMemoryGalleryRepository() },
  ],
  // Admin config (T2.9) reads the same site record.
  exports: [SITE_REPOSITORY],
})
export class SiteModule {}
