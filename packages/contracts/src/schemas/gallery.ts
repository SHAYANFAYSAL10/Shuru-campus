import { z } from 'zod';

import { ImageSrc } from './brand';
import { Slug, text } from './primitives';

export const GALLERY_CATEGORIES = ['workspace', 'meeting', 'cafe', 'events'] as const;
export const GalleryCategory = z.enum(GALLERY_CATEGORIES);
export type GalleryCategory = z.infer<typeof GalleryCategory>;

export const GalleryImage = z.object({
  id: Slug,
  src: ImageSrc,
  width: z.int().positive(),
  height: z.int().positive(),
  /** Gallery photos are content, so alt text is required. */
  alt: text(1, 200, 'Alt text'),
  category: GalleryCategory,
  /** Tiny base64 preview for `placeholder="blur"`. */
  blurDataUrl: z.string().regex(/^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,/),
});
export type GalleryImage = z.infer<typeof GalleryImage>;

/** `GET /gallery?category=` */
export const GalleryQuery = z.object({ category: GalleryCategory.optional() });
export type GalleryQuery = z.infer<typeof GalleryQuery>;
