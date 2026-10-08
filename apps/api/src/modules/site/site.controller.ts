import { Controller, Get, Query } from '@nestjs/common';

import {
  type Amenity,
  type GalleryImage,
  GalleryQuery,
  type SiteSettings,
} from '@campus/contracts';

import { PublicCache } from '#src/common/cache-control.js';
import { ZodValidationPipe } from '#src/common/zod-validation.pipe.js';

import { SiteService } from './site.service.js';

@Controller()
@PublicCache()
export class SiteController {
  constructor(private readonly site: SiteService) {}

  @Get('site')
  getSite(): Promise<SiteSettings> {
    return this.site.getSettings();
  }

  @Get('amenities')
  async listAmenities(): Promise<{ items: Amenity[] }> {
    return { items: await this.site.listAmenities() };
  }

  @Get('gallery')
  async listGallery(
    @Query(new ZodValidationPipe(GalleryQuery, 'That gallery filter is invalid.'))
    query: GalleryQuery,
  ): Promise<{ items: GalleryImage[] }> {
    return { items: await this.site.listGallery(query) };
  }
}
