import { Controller, Get } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import {
  type Amenity,
  GALLERY_CATEGORIES,
  type GalleryImage,
  GalleryQuery,
  type SiteSettings,
} from '@campus/contracts';

import { PublicCache } from '#src/common/cache-control.js';
import { ApiErrors, ApiJson } from '#src/common/openapi.js';
import { ZodQuery } from '#src/common/zod-validation.pipe.js';

import { SiteService } from './site.service.js';

@Controller()
@PublicCache()
@ApiTags('site')
export class SiteController {
  constructor(private readonly site: SiteService) {}

  @Get('site')
  @ApiJson(200, 'SiteSettings')
  getSite(): Promise<SiteSettings> {
    return this.site.getSettings();
  }

  @Get('amenities')
  @ApiJson(200, 'Amenity', { collection: true })
  async listAmenities(): Promise<{ items: Amenity[] }> {
    return { items: await this.site.listAmenities() };
  }

  @Get('gallery')
  @ApiQuery({ name: 'category', required: false, enum: GALLERY_CATEGORIES })
  @ApiJson(200, 'GalleryImage', { collection: true })
  @ApiErrors(400)
  async listGallery(
    @ZodQuery(GalleryQuery, 'That gallery filter is invalid.')
    query: GalleryQuery,
  ): Promise<{ items: GalleryImage[] }> {
    return { items: await this.site.listGallery(query) };
  }
}
