import {
  type Amenity,
  type GalleryCategory,
  type GalleryImage,
  type SiteSettings,
} from '@campus/contracts';

/** Site settings (brand, contact, hours, flags): a single record. */
export interface SiteRepository {
  get(): Promise<SiteSettings>;
}
export const SITE_REPOSITORY = Symbol('SITE_REPOSITORY');

export interface AmenitiesRepository {
  findAll(): Promise<Amenity[]>;
}
export const AMENITIES_REPOSITORY = Symbol('AMENITIES_REPOSITORY');

export interface GalleryFilter {
  category?: GalleryCategory;
}

export interface GalleryRepository {
  /** Every image (or only those in `category`) in display order. */
  findAll(filter?: GalleryFilter): Promise<GalleryImage[]>;
}
export const GALLERY_REPOSITORY = Symbol('GALLERY_REPOSITORY');
