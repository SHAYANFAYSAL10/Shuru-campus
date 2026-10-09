import { type GalleryCategory, type GalleryImage } from '../schemas/gallery';

// TODO(client): high-resolution photos and usage rights (docs/09-roadmap.md #3). These are
// free-licensed stock stand-ins (apps/web/scripts/fetch-photos.mjs, credits in
// /public/placeholder/CREDITS.md) at final aspect ratios, so swapping in real photos only
// touches this file and /public/placeholder.

/**
 * Tiny flat SVG in the photo's mean color (printed by fetch-photos.mjs), the blur preview until
 * real photos (and real blurs) arrive. Colors are image pixels, not UI tokens.
 */
function flatBlur(width: number, height: number, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${color}"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function placeholder(
  id: string,
  category: GalleryCategory,
  [width, height]: readonly [number, number],
  subject: string,
  meanColor: string,
): GalleryImage {
  return {
    id,
    src: `/placeholder/${id}.jpg`,
    width,
    height,
    alt: `Placeholder photo: ${subject}`,
    category,
    blurDataUrl: flatBlur(width, height, meanColor),
  };
}

const LANDSCAPE = [1600, 1067] as const; // 3:2
const PORTRAIT = [1200, 1500] as const; // 4:5
const WIDE = [1920, 1080] as const; // 16:9

export const gallerySeed: readonly GalleryImage[] = [
  placeholder(
    'workspace-1',
    'workspace',
    LANDSCAPE,
    'rows of shared desks in a long hall',
    '#6b6762',
  ),
  placeholder(
    'workspace-2',
    'workspace',
    PORTRAIT,
    'a quiet desk by a curtained window',
    '#bcb1a3',
  ),
  placeholder('workspace-3', 'workspace', WIDE, 'a quiet table by tall windows', '#907c6e'),
  placeholder('meeting-1', 'meeting', LANDSCAPE, 'a meeting table against a brick wall', '#927c67'),
  placeholder(
    'meeting-2',
    'meeting',
    PORTRAIT,
    'a small meeting room with a whiteboard',
    '#b8b0ac',
  ),
  placeholder('meeting-3', 'meeting', WIDE, 'a seminar room set up for a workshop', '#b2ada8'),
  placeholder('cafe-1', 'cafe', PORTRAIT, 'a barista at the café counter', '#838181'),
  placeholder('cafe-2', 'cafe', LANDSCAPE, 'iced coffees in a sofa corner', '#8d8589'),
  placeholder('events-1', 'events', WIDE, 'a speaker at a community meetup', '#898a87'),
  placeholder('events-2', 'events', LANDSCAPE, 'a training session around a long table', '#a59c98'),
];
