/** A photo file under /public, at its intrinsic size. */
export interface MediaSource {
  src: string;
  width: number;
  height: number;
}

/**
 * The Home hero photo, art-directed (B4): 4:5 on phones, 16:9 from `md`. Stock stand-ins from
 * `scripts/fetch-photos.mjs` (credits in public/placeholder/CREDITS.md).
 * TODO(client): real photos and usage rights (docs/09-roadmap.md #3); swap the files and alt here.
 */
export const HERO_MEDIA = {
  alt: 'Placeholder photo: a sunlit lounge with plants and yellow armchairs',
  tall: { src: '/placeholder/hero-tall.jpg', width: 1200, height: 1500 },
  wide: { src: '/placeholder/hero-wide.jpg', width: 1920, height: 1080 },
} as const satisfies { alt: string; tall: MediaSource; wide: MediaSource };
