import { type MediaSource } from '@/lib/hero-media';

/**
 * The About story photo, editorial 3:2 (B4). A stock stand-in from `scripts/fetch-photos.mjs`.
 * TODO(client): real photos and usage rights (docs/09-roadmap.md #3); swap the file and alt here.
 */
export const ABOUT_STORY_MEDIA = {
  alt: 'Placeholder photo: people working together around a shared table',
  src: '/placeholder/about-story.jpg',
  width: 1800,
  height: 1200,
} as const satisfies MediaSource & { alt: string };
