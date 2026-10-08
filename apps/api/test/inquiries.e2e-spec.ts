import { type NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { ApiError, dhakaToday, InquiryAccepted, type InquiryCreateInput } from '@campus/contracts';

import { createTestApp } from '#test/helpers/test-app.js';

const valid: InquiryCreateInput = {
  name: 'Nadia Rahman',
  email: 'nadia.rahman@example.com',
  phone: '+880 1711-000000',
  planSlug: 'private-office',
  teamSize: 4,
  preferredDate: dhakaToday(),
  message: 'We are a team of four looking for a private office from next month.',
};

describe('POST /api/v1/inquiries', () => {
  let app: NestExpressApplication;
  let logs: string[];

  beforeAll(async () => {
    ({ app, logs } = await createTestApp({}, { logLevel: 'info' }));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    logs.length = 0;
  });

  it('accepts a valid inquiry with 202 { id, receivedAt }, never cached', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/inquiries')
      .send(valid)
      .expect(202);
    const body = InquiryAccepted.parse(res.body);
    expect(Date.parse(body.receivedAt)).toBeLessThanOrEqual(Date.now());
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('accepts the minimum: name, email and message', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/inquiries')
      .send({ name: valid.name, email: valid.email, message: valid.message })
      .expect(202);
  });

  it('logs a summary without the name, email, phone or message', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/inquiries')
      .send(valid)
      .expect(202);
    const { id } = InquiryAccepted.parse(res.body);

    const line = logs.find((l) => l.includes('Inquiry received'));
    expect(line).toBeDefined();
    expect(JSON.parse(line ?? '{}')).toMatchObject({
      inquiry: { inquiryId: id, planSlug: 'private-office', teamSize: 4, hasPhone: true },
    });
    const all = logs.join('\n');
    for (const secret of ['Nadia', 'nadia.rahman', '1711', 'private office from next month']) {
      expect(all).not.toContain(secret);
    }
  });

  it('rejects invalid fields with 400 VALIDATION_FAILED and a detail per field', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/inquiries')
      .send({ ...valid, email: 'not-an-email', message: 'too short', planSlug: 'penthouse' })
      .expect(400);
    const { error } = ApiError.parse(res.body);
    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.details?.map((d) => d.path).toSorted()).toEqual(['email', 'message', 'planSlug']);
    expect(logs.join('\n')).not.toContain('Inquiry received');
  });

  it('rejects a missing body', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/inquiries').expect(400);
    expect(ApiError.parse(res.body).error.code).toBe('VALIDATION_FAILED');
  });

  it('answers a filled honeypot exactly like a real inquiry, but drops it', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/inquiries')
      .send({ ...valid, website: 'https://spam.example' })
      .expect(202);
    InquiryAccepted.parse(res.body);
    expect(logs.join('\n')).not.toContain('Inquiry received');
    expect(logs.join('\n')).toContain('honeypot');
    expect(logs.join('\n')).not.toContain('spam.example');
  });
});

describe('POST /api/v1/inquiries throttling', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp({ THROTTLE_INQUIRY_LIMIT: '5' }));
  });

  afterAll(async () => {
    await app.close();
  });

  it('blocks the 6th inquiry in a minute with 429 and Retry-After', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer()).post('/api/v1/inquiries').send(valid).expect(202);
    }
    const res = await request(app.getHttpServer())
      .post('/api/v1/inquiries')
      .send(valid)
      .expect(429);
    expect(ApiError.parse(res.body).error.code).toBe('RATE_LIMITED');
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
  });
});
