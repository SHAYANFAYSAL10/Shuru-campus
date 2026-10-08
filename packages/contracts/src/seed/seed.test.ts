import { describe, expect, it } from 'vitest';

import { amenitiesSeed, defaultBrand, gallerySeed, plansSeed, siteSeed } from './index';
import { Amenity } from '../schemas/amenity';
import { Brand } from '../schemas/brand';
import { GalleryImage, GALLERY_CATEGORIES } from '../schemas/gallery';
import { PLAN_SLUGS, PlanList } from '../schemas/plan';
import { SiteSettings } from '../schemas/site';

describe('seed data', () => {
  it('brand passes its schema and matches docs/02-content.md', () => {
    const brand = Brand.parse(defaultBrand);
    expect(brand.pillars).toEqual(['Empower', 'Enhance', 'Enrich']);
    expect(brand.nameMeaning?.meaning).toBe('beginning');
  });

  it('site settings pass their schema and embed the default brand', () => {
    const site = SiteSettings.parse(siteSeed);
    expect(site.brand).toEqual(defaultBrand);
    expect(site.contact.phones).toEqual(['+88 09666-731731', '+88 01700-766084']);
  });

  it('hours are Saturday–Thursday 09:00–19:00 with Friday closed', () => {
    const byDay = new Map(siteSeed.hours.weekly.map((d) => [d.day, d]));
    for (const day of [6, 0, 1, 2, 3, 4]) {
      expect(byDay.get(day)).toEqual({ day, open: '09:00', close: '19:00' });
    }
    expect(byDay.get(5)).toEqual({ day: 5, open: null, close: null });
  });

  it('has the six plans, valid, uniquely slugged and in order', () => {
    const plans = PlanList.parse(plansSeed);
    expect(plans.map((p) => p.slug)).toEqual([...PLAN_SLUGS]);
    expect(plans.map((p) => p.order)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('prices are positive whole taka', () => {
    for (const rate of plansSeed.flatMap((p) => p.rates)) {
      expect(Number.isInteger(rate.amountBdt)).toBe(true);
      expect(rate.amountBdt).toBeGreaterThan(0);
    }
  });

  it('prices match docs/02-content.md exactly', () => {
    const prices = Object.fromEntries(
      plansSeed.map((p) => [p.slug, p.rates.map((r) => [r.amountBdt, r.unit])]),
    );
    expect(prices).toEqual({
      'hot-desk': [
        [100, 'hour'],
        [650, 'day'],
      ],
      'business-seating': [
        [2800, 'week'],
        [10000, 'month'],
      ],
      'executive-seating': [
        [4000, 'week'],
        [14000, 'month'],
        [17000, 'month'],
      ],
      'private-office': [
        [40000, 'month'],
        [50000, 'month'],
        [60000, 'month'],
      ],
      'meeting-room': [
        [1000, 'hour'],
        [500, 'hour'],
        [300, 'hour'],
      ],
      'seminar-room': [
        [3000, 'hour'],
        [3000, 'hour'],
        [10000, 'block'],
      ],
    });
  });

  it('has the eleven amenities, valid and uniquely identified', () => {
    const amenities = amenitiesSeed.map((a) => Amenity.parse(a));
    expect(amenities).toHaveLength(11);
    expect(new Set(amenities.map((a) => a.id)).size).toBe(11);
  });

  it('gallery placeholders are valid, unique, marked as placeholders and cover every category', () => {
    const images = gallerySeed.map((g) => GalleryImage.parse(g));
    expect(new Set(images.map((i) => i.id)).size).toBe(images.length);
    expect(images.every((i) => i.alt.startsWith('Placeholder'))).toBe(true);
    expect(new Set(images.map((i) => i.category))).toEqual(new Set(GALLERY_CATEGORIES));
  });
});
