import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { type NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import {
  Amenity,
  amenitiesSeed,
  ApiError,
  collectionOf,
  defaultBrand,
  GALLERY_CATEGORIES,
  GalleryImage,
  gallerySeed,
  SiteSettings,
} from '@campus/contracts';

import { PUBLIC_CACHE } from '#src/common/cache-control.js';
import { createTestApp } from '#test/helpers/test-app.js';

describe('Site endpoints', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/site', () => {
    it('returns SiteSettings with the default brand, publicly cacheable', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/site').expect(200);
      const site = SiteSettings.parse(res.body);
      expect(site.brand).toEqual(defaultBrand);
      expect(site.hours.timezone).toBe('Asia/Dhaka');
      expect(res.headers['cache-control']).toBe(PUBLIC_CACHE);
    });
  });

  describe('GET /api/v1/amenities', () => {
    it('returns every amenity as a collection', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/amenities').expect(200);
      const { items } = collectionOf(Amenity).parse(res.body);
      expect(items.map((a) => a.id)).toEqual(amenitiesSeed.map((a) => a.id));
      expect(res.headers['cache-control']).toBe(PUBLIC_CACHE);
    });
  });

  describe('GET /api/v1/gallery', () => {
    it('returns every image without a filter', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/gallery').expect(200);
      const { items } = collectionOf(GalleryImage).parse(res.body);
      expect(items).toHaveLength(gallerySeed.length);
      expect(res.headers['cache-control']).toBe(PUBLIC_CACHE);
    });

    it.each(GALLERY_CATEGORIES)('filters by ?category=%s', async (category) => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/gallery')
        .query({ category })
        .expect(200);
      const { items } = collectionOf(GalleryImage).parse(res.body);
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((i) => i.category === category)).toBe(true);
    });

    it('rejects an unknown category with 400 VALIDATION_FAILED on the category field', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/gallery')
        .query({ category: 'rooftop' })
        .expect(400);
      const { error } = ApiError.parse(res.body);
      expect(error).toMatchObject({
        code: 'VALIDATION_FAILED',
        message: 'That gallery filter is invalid.',
      });
      expect(error.details?.map((d) => d.path)).toEqual(['category']);
      expect(res.headers['cache-control']).toBe('no-store');
    });

    it('rejects a repeated category parameter', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/gallery?category=cafe&category=events')
        .expect(400);
    });
  });
});

describe('GET /api/v1/site with BRAND_SEED', () => {
  const acme = {
    name: 'Acme Works',
    shortName: 'Acme',
    legalName: 'Acme Works Ltd.',
    tagline: 'Work, together',
    subTagline: 'A place to begin',
    pillars: ['Focus'],
    logo: { kind: 'wordmark' },
  };
  let app: NestExpressApplication;

  beforeAll(async () => {
    const file = join(mkdtempSync(join(tmpdir(), 'brand-')), 'brand.json');
    writeFileSync(file, JSON.stringify(acme));
    ({ app } = await createTestApp({ BRAND_SEED: file }));
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the override brand', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/site').expect(200);
    expect(SiteSettings.parse(res.body).brand).toEqual(acme);
  });
});
