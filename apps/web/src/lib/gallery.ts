import { GALLERY_CATEGORIES, type GalleryCategory, type GalleryImage } from '@campus/contracts';

/**
 * The Gallery's filter chips (docs/05-pages-and-interactions.md → Gallery), in display order.
 * `subject` finishes "Showing 3 photos …".
 */
export const GALLERY_FILTERS = [
  { value: 'workspace', label: 'Workspace', subject: 'of the workspace' },
  { value: 'meeting', label: 'Meeting rooms', subject: 'of the meeting rooms' },
  { value: 'cafe', label: 'Café', subject: 'of the café' },
  { value: 'events', label: 'Events', subject: 'from our events' },
] as const satisfies readonly { value: GalleryCategory; label: string; subject: string }[];

/** The query parameter that carries the category: `/gallery?category=cafe`. */
export const CATEGORY_PARAM = 'category';

/** `?category=` as a category, or `undefined` (every photo) when missing, repeated or unknown. */
export function parseCategory(
  raw: string | string[] | null | undefined,
): GalleryCategory | undefined {
  if (typeof raw !== 'string') return undefined;
  return GALLERY_CATEGORIES.find((category) => category === raw);
}

export function categoryInfo(category: GalleryCategory): (typeof GALLERY_FILTERS)[number] {
  const info = GALLERY_FILTERS.find((entry) => entry.value === category);
  // GALLERY_FILTERS lists every category; this keeps the type honest.
  if (!info) throw new Error(`Unknown gallery category ${category}`);
  return info;
}

/** The photos in `category`, in their own order; every photo without one. */
export function filterGallery(
  images: readonly GalleryImage[],
  category: GalleryCategory | undefined,
): GalleryImage[] {
  return category ? images.filter((image) => image.category === category) : [...images];
}

/**
 * Where to send someone who chose an empty category ("Nothing in Events yet. Try Workspace."):
 * the first other category, in chip order, that has photos.
 */
export function suggestCategory(
  images: readonly GalleryImage[],
  except: GalleryCategory,
): GalleryCategory | undefined {
  const present = new Set(images.map((image) => image.category));
  return GALLERY_FILTERS.find(({ value }) => value !== except && present.has(value))?.value;
}

/** What the grid is showing, announced as it changes: "Showing 3 photos of the café." */
export function gallerySummary(category: GalleryCategory | undefined, matching: number): string {
  if (!category)
    return matching === 1 ? 'Showing the one photo.' : `Showing all ${String(matching)} photos.`;
  const { label, subject } = categoryInfo(category);
  if (matching === 0) return `Nothing in ${label} yet.`;
  if (matching === 1) return `Showing the one photo ${subject}.`;
  return `Showing ${String(matching)} photos ${subject}.`;
}
