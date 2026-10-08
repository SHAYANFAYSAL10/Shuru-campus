import { z } from 'zod';

import { HttpsUrl, text } from './primitives';

/** Path under /public (e.g. `/brand/logo.svg`) or https URL. */
export const ImageSrc = z.union([z.string().regex(/^\/(?!\/)\S+$/), HttpsUrl]);

export const BrandLogo = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('wordmark') }),
  z.object({
    kind: z.literal('image'),
    src: ImageSrc,
    srcDark: ImageSrc.optional(),
    alt: text(1, 120, 'Logo description'),
  }),
]);
export type BrandLogo = z.infer<typeof BrandLogo>;

export const Brand = z.object({
  /** Logo wordmark, `<title>`, Open Graph, JSON-LD, footer. */
  name: text(1, 60, 'Brand name'),
  /** Used in running copy, e.g. "A day at {shortName}". */
  shortName: text(1, 24, 'Short name'),
  /** Legal pages and copyright. */
  legalName: text(1, 120, 'Legal name'),
  tagline: text(1, 120, 'Tagline'),
  subTagline: text(1, 200, 'Sub-tagline'),
  pillars: z
    .array(text(1, 24, 'Pillar'))
    .min(1, { error: 'Add at least one pillar.' })
    .max(4, { error: 'Use at most four pillars.' }),
  /** Optional; hides the "meaning of the name" block when absent. */
  nameMeaning: z
    .object({
      word: text(1, 40, 'Word'),
      language: text(1, 40, 'Language'),
      meaning: text(1, 120, 'Meaning'),
    })
    .optional(),
  logo: BrandLogo,
});
export type Brand = z.infer<typeof Brand>;
