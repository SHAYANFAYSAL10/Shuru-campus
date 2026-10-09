import { describe, expect, it } from 'vitest';

import { GALLERY_CATEGORIES, gallerySeed, type GalleryImage } from '@campus/contracts';

import {
  categoryInfo,
  filterGallery,
  GALLERY_FILTERS,
  gallerySummary,
  parseCategory,
  suggestCategory,
} from '@/lib/gallery';

const only = (...categories: GalleryImage['category'][]) =>
  gallerySeed.filter((image) => categories.includes(image.category));

describe('gallery filters', () => {
  it('has one chip per category, in the order the page shows them', () => {
    expect(GALLERY_FILTERS.map((filter) => filter.value)).toEqual([...GALLERY_CATEGORIES]);
    expect(GALLERY_FILTERS.map((filter) => filter.label)).toEqual([
      'Workspace',
      'Meeting rooms',
      'Café',
      'Events',
    ]);
  });

  it('reads ?category= and ignores anything it does not know', () => {
    expect(parseCategory('cafe')).toBe('cafe');
    expect(parseCategory('lobby')).toBeUndefined();
    expect(parseCategory('')).toBeUndefined();
    expect(parseCategory(['cafe', 'events'])).toBeUndefined();
    expect(parseCategory(undefined)).toBeUndefined();
    expect(parseCategory(null)).toBeUndefined();
  });

  it('describes each category', () => {
    expect(categoryInfo('meeting')).toMatchObject({ label: 'Meeting rooms' });
    // @ts-expect-error: a category the contract doesn't have.
    expect(() => categoryInfo('lobby')).toThrow('Unknown gallery category lobby');
  });
});

describe('filterGallery', () => {
  it('keeps a category’s photos in their own order', () => {
    expect(filterGallery(gallerySeed, 'meeting').map((image) => image.id)).toEqual([
      'meeting-1',
      'meeting-2',
      'meeting-3',
    ]);
  });

  it('returns every photo, as a copy, without a category', () => {
    const all = filterGallery(gallerySeed, undefined);
    expect(all).toEqual(gallerySeed);
    expect(all).not.toBe(gallerySeed);
  });
});

describe('suggestCategory', () => {
  it('suggests the first other category that has photos', () => {
    expect(suggestCategory(only('cafe', 'events'), 'workspace')).toBe('cafe');
    expect(suggestCategory(only('workspace', 'events'), 'workspace')).toBe('events');
  });

  it('has nothing to suggest when no other category has photos', () => {
    expect(suggestCategory(only('events'), 'events')).toBeUndefined();
    expect(suggestCategory([], 'cafe')).toBeUndefined();
  });
});

describe('gallerySummary', () => {
  it('counts every photo without a category', () => {
    expect(gallerySummary(undefined, 10)).toBe('Showing all 10 photos.');
    expect(gallerySummary(undefined, 1)).toBe('Showing the one photo.');
  });

  it('names the category it shows', () => {
    expect(gallerySummary('meeting', 3)).toBe('Showing 3 photos of the meeting rooms.');
    expect(gallerySummary('cafe', 1)).toBe('Showing the one photo of the café.');
    expect(gallerySummary('events', 2)).toBe('Showing 2 photos from our events.');
  });

  it('says when a category is empty (B5)', () => {
    expect(gallerySummary('events', 0)).toBe('Nothing in Events yet.');
  });
});
