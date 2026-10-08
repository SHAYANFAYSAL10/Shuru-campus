import { Inject, Injectable } from '@nestjs/common';

import {
  type Amenity,
  type GalleryImage,
  type GalleryQuery,
  type SiteSettings,
} from '@campus/contracts';

import {
  AMENITIES_REPOSITORY,
  type AmenitiesRepository,
  GALLERY_REPOSITORY,
  type GalleryRepository,
  SITE_REPOSITORY,
  type SiteRepository,
} from './site.repository.js';

@Injectable()
export class SiteService {
  constructor(
    @Inject(SITE_REPOSITORY) private readonly site: SiteRepository,
    @Inject(AMENITIES_REPOSITORY) private readonly amenities: AmenitiesRepository,
    @Inject(GALLERY_REPOSITORY) private readonly gallery: GalleryRepository,
  ) {}

  getSettings(): Promise<SiteSettings> {
    return this.site.get();
  }

  listAmenities(): Promise<Amenity[]> {
    return this.amenities.findAll();
  }

  listGallery(query: GalleryQuery): Promise<GalleryImage[]> {
    return this.gallery.findAll(query);
  }
}
