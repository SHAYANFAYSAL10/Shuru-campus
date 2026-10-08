import { z } from 'zod';

import {
  Amenity,
  amenitiesSeed,
  type Brand,
  GalleryImage,
  gallerySeed,
  SiteSettings,
  siteSeed,
} from '@campus/contracts';

import { uniqueBy, validateSeed } from '#src/common/seed.js';

import {
  type AmenitiesRepository,
  type GalleryFilter,
  type GalleryRepository,
  type SiteRepository,
} from './site.repository.js';

// Phase 1 repositories. Seeds are validated once at construction (i.e. at boot), and reads
// hand out copies so a caller can never change what later requests see.

const AmenityList = uniqueBy(z.array(Amenity), (a) => a.id, 'Amenity IDs must be unique.');
const GalleryList = uniqueBy(
  z.array(GalleryImage),
  (i) => i.id,
  'Gallery image IDs must be unique.',
);

export class InMemorySiteRepository implements SiteRepository {
  private readonly site: SiteSettings;

  /** `brand` is the boot brand: `defaultBrand` or the `BRAND_SEED` override. */
  constructor(brand: Brand, seed: unknown = siteSeed) {
    const site = validateSeed('site', SiteSettings, seed);
    this.site = { ...site, brand };
  }

  get(): Promise<SiteSettings> {
    return Promise.resolve(structuredClone(this.site));
  }
}

export class InMemoryAmenitiesRepository implements AmenitiesRepository {
  private readonly amenities: Amenity[];

  constructor(seed: unknown = amenitiesSeed) {
    this.amenities = validateSeed('amenities', AmenityList, seed);
  }

  findAll(): Promise<Amenity[]> {
    return Promise.resolve(structuredClone(this.amenities));
  }
}

export class InMemoryGalleryRepository implements GalleryRepository {
  private readonly images: GalleryImage[];

  constructor(seed: unknown = gallerySeed) {
    this.images = validateSeed('gallery', GalleryList, seed);
  }

  findAll({ category }: GalleryFilter = {}): Promise<GalleryImage[]> {
    const images = category ? this.images.filter((i) => i.category === category) : this.images;
    return Promise.resolve(structuredClone(images));
  }
}
