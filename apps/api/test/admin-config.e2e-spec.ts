import { type NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import {
  AdminConfig,
  ApiError,
  type FeaturesUpdate,
  plansSeed,
  PreviewSaveResult,
  type SiteSettings,
} from '@campus/contracts';

import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_WEB_ORIGIN } from '#test/fixtures/env.js';
import { createTestApp } from '#test/helpers/test-app.js';

const [hotDesk] = plansSeed;
if (!hotDesk) throw new Error('Seed has no plans');

describe('Admin config endpoints', () => {
  let app: NestExpressApplication;
  let cookie: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Origin', TEST_WEB_ORIGIN)
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
      .expect(200);
    const setCookie: unknown = res.headers['set-cookie'];
    cookie = Array.isArray(setCookie) ? (String(setCookie[0]).split(';')[0] ?? '') : '';
  });

  afterAll(async () => {
    await app.close();
  });

  const get = () => request(app.getHttpServer()).get('/api/v1/admin/config').set('Cookie', cookie);
  const put = (path: string, body: unknown) =>
    request(app.getHttpServer())
      .put(`/api/v1/admin/config/${path}`)
      .set('Origin', TEST_WEB_ORIGIN)
      .set('Cookie', cookie)
      .send(body as object);

  async function currentSite(): Promise<SiteSettings> {
    return AdminConfig.parse((await get().expect(200)).body).site;
  }

  describe('authentication', () => {
    it.each([
      ['GET', '/api/v1/admin/config'],
      ['PUT', '/api/v1/admin/config/site'],
      ['PUT', '/api/v1/admin/config/plans/hot-desk'],
      ['PUT', '/api/v1/admin/config/features'],
    ])('%s %s returns 401 without a session', async (method, path) => {
      const req =
        method === 'GET'
          ? request(app.getHttpServer()).get(path)
          : request(app.getHttpServer()).put(path).set('Origin', TEST_WEB_ORIGIN).send({});
      const res = await req.expect(401);
      expect(ApiError.parse(res.body).error.code).toBe('UNAUTHENTICATED');
    });

    it('returns 403 for a save from a foreign Origin, even when signed in', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/config/features')
        .set('Origin', 'https://evil.example')
        .set('Cookie', cookie)
        .send({})
        .expect(403);
    });
  });

  describe('GET /api/v1/admin/config', () => {
    it('returns what the public site serves, marked read-only and never cached', async () => {
      const res = await get().expect(200);
      const config = AdminConfig.parse(res.body);
      const publicSite: unknown = (await request(app.getHttpServer()).get('/api/v1/site')).body;
      const publicPlans: unknown = (await request(app.getHttpServer()).get('/api/v1/plans')).body;
      expect(config.site).toEqual(publicSite);
      expect({ items: config.plans }).toEqual(publicPlans);
      expect(config.meta).toMatchObject({ dataSource: 'memory', editable: false });
      expect(res.headers['cache-control']).toBe('no-store');
    });
  });

  describe('PUT /api/v1/admin/config/site', () => {
    it('validates a full site and returns 202 persisted: false; a follow-up GET is unchanged', async () => {
      const before = await currentSite();
      const edited = { ...before, brand: { ...before.brand, tagline: 'A new tagline' } };
      const res = await put('site', edited).expect(202);
      expect(PreviewSaveResult.parse(res.body)).toEqual({
        persisted: false,
        validated: true,
        message: "Looks good. Changes are valid but weren't saved (preview mode).",
      });
      expect(res.headers['cache-control']).toBe('no-store');
      expect(await currentSite()).toEqual(before);
    });

    it('returns 400 with a path for each invalid field', async () => {
      const site = await currentSite();
      const res = await put('site', {
        ...site,
        brand: { ...site.brand, name: '' },
        contact: { ...site.contact, phones: ['12'], mapUrl: 'http://maps.example' },
      }).expect(400);
      const { error } = ApiError.parse(res.body);
      expect(error.code).toBe('VALIDATION_FAILED');
      expect(error.details?.map((d) => d.path).toSorted()).toEqual([
        'brand.name',
        'contact.mapUrl',
        'contact.phones.0',
      ]);
    });
  });

  describe('PUT /api/v1/admin/config/plans/:slug', () => {
    it('validates a plan and returns 202 persisted: false; the plan is unchanged', async () => {
      const res = await put('plans/hot-desk', { ...hotDesk, name: 'Hotter Desk' }).expect(202);
      expect(PreviewSaveResult.parse(res.body).persisted).toBe(false);
      const plan: unknown = (await request(app.getHttpServer()).get('/api/v1/plans/hot-desk')).body;
      expect(plan).toEqual(hotDesk);
    });

    it('rejects fractional prices and empty rates with field paths', async () => {
      const res = await put('plans/hot-desk', {
        ...hotDesk,
        rates: [{ id: 'day', amountBdt: 99.5, unit: 'day' }],
        audience: [],
      }).expect(400);
      expect(
        ApiError.parse(res.body)
          .error.details?.map((d) => d.path)
          .toSorted(),
      ).toEqual(['audience', 'rates.0.amountBdt']);
    });

    it("rejects a body whose slug doesn't match the URL", async () => {
      const res = await put('plans/meeting-room', hotDesk).expect(400);
      expect(ApiError.parse(res.body).error.details).toEqual([
        { path: 'slug', message: "A plan's slug can't be changed." },
      ]);
    });
  });

  describe('PUT /api/v1/admin/config/features', () => {
    const features: FeaturesUpdate = {
      inquiryForm: false,
      gallery: true,
      maintenanceMode: false,
      announcement: { enabled: true, text: 'Closed for Eid on Monday', href: '/contact' },
    };

    it('validates flags and returns 202 persisted: false; the site is unchanged', async () => {
      const before = await currentSite();
      const res = await put('features', features).expect(202);
      expect(PreviewSaveResult.parse(res.body).persisted).toBe(false);
      expect(await currentSite()).toEqual(before);
    });

    it('requires announcement text when the banner is on', async () => {
      const res = await put('features', {
        ...features,
        announcement: { enabled: true, text: '' },
      }).expect(400);
      expect(ApiError.parse(res.body).error.details?.map((d) => d.path)).toEqual([
        'announcement.text',
      ]);
    });

    it('rejects a missing body', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/config/features')
        .set('Origin', TEST_WEB_ORIGIN)
        .set('Cookie', cookie)
        .expect(400);
    });
  });
});
