import { type GalleryCategory, type GalleryImage } from '../schemas/gallery';

// TODO(client): high-resolution photos and usage rights (docs/09-roadmap.md #3). These are
// clearly marked placeholders at final aspect ratios, so swapping in real photos only
// touches this file and /public/placeholder.

/** Tiny flat-color SVG used as the blur preview until real photos (and real blurs) arrive. */
function flatBlur(width: number, height: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#cfc6b8"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function placeholder(
  id: string,
  category: GalleryCategory,
  [width, height]: readonly [number, number],
  subject: string,
): GalleryImage {
  return {
    id,
    src: `/placeholder/${id}.jpg`,
    width,
    height,
    alt: `Placeholder photo: ${subject}`,
    category,
    blurDataUrl: flatBlur(width, height),
  };
}

const LANDSCAPE = [1600, 1067] as const; // 3:2
const PORTRAIT = [1200, 1500] as const; // 4:5
const WIDE = [1920, 1080] as const; // 16:9

export const gallerySeed: readonly GalleryImage[] = [
  placeholder('workspace-1', 'workspace', LANDSCAPE, 'open-plan desks by the window'),
  placeholder('workspace-2', 'workspace', PORTRAIT, 'a dedicated cubicle'),
  placeholder('workspace-3', 'workspace', WIDE, 'the silent room'),
  placeholder('meeting-1', 'meeting', LANDSCAPE, 'the big meeting room'),
  placeholder('meeting-2', 'meeting', PORTRAIT, 'the mini meeting room'),
  placeholder('meeting-3', 'meeting', WIDE, 'the seminar room set up for a workshop'),
  placeholder('cafe-1', 'cafe', PORTRAIT, 'the café counter'),
  placeholder('cafe-2', 'cafe', LANDSCAPE, 'the timeout zone'),
  placeholder('events-1', 'events', WIDE, 'a community event'),
  placeholder('events-2', 'events', LANDSCAPE, 'a training session'),
];
