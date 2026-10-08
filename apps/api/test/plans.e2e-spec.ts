import { type NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { ApiError, collectionOf, Plan, PLAN_SLUGS } from '@campus/contracts';

import { PUBLIC_CACHE } from '#src/common/cache-control.js';
import { createTestApp } from '#test/helpers/test-app.js';

describe('Plans endpoints', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/plans', () => {
    it('returns every plan ordered by `order`, publicly cacheable', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/plans').expect(200);
      const { items } = collectionOf(Plan).parse(res.body);
      expect(items.map((p) => p.slug).toSorted()).toEqual([...PLAN_SLUGS].toSorted());
      const orders = items.map((p) => p.order);
      expect(orders).toEqual(orders.toSorted((a, b) => a - b));
      expect(res.headers['cache-control']).toBe(PUBLIC_CACHE);
    });
  });

  describe('GET /api/v1/plans/:slug', () => {
    it.each(PLAN_SLUGS)('returns %s', async (slug) => {
      const res = await request(app.getHttpServer()).get(`/api/v1/plans/${slug}`).expect(200);
      expect(Plan.parse(res.body).slug).toBe(slug);
      expect(res.headers['cache-control']).toBe(PUBLIC_CACHE);
    });

    it('returns 404 NOT_FOUND for an unknown slug, never cached', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/plans/penthouse').expect(404);
      expect(ApiError.parse(res.body).error).toMatchObject({
        code: 'NOT_FOUND',
        message: "We couldn't find that plan.",
      });
      expect(res.headers['cache-control']).toBe('no-store');
    });
  });
});
