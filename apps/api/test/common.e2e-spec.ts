import { type NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { ApiError } from '@campus/contracts';

import { createTestApp } from '#test/helpers/test-app.js';

describe('Common HTTP behavior', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves routes only under /api/v1', async () => {
    await request(app.getHttpServer()).get('/health').expect(404);
  });

  it('renders unknown routes as NOT_FOUND with the request ID', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/nope').expect(404);
    const body = ApiError.parse(res.body);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.requestId).toBe(res.headers['x-request-id']);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('generates a request ID, or reuses a safe incoming one', async () => {
    const generated = await request(app.getHttpServer()).get('/api/v1/health');
    expect(generated.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);

    const reused = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('X-Request-Id', 'web-abc12345');
    expect(reused.headers['x-request-id']).toBe('web-abc12345');

    const unsafe = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('X-Request-Id', '<script>');
    expect(unsafe.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('rejects malformed JSON with VALIDATION_FAILED', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/health')
      .set('Content-Type', 'application/json')
      .send('{ "oops": ');
    expect(res.status).toBe(400);
    expect(ApiError.parse(res.body).error).toMatchObject({
      code: 'VALIDATION_FAILED',
      message: "The request body isn't valid JSON.",
    });
  });

  it('rejects oversized bodies with VALIDATION_FAILED instead of a 500', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/health')
      .send({ blob: 'x'.repeat(200_000) });
    expect(res.status).toBe(400);
    expect(ApiError.parse(res.body).error.message).toBe('The request body is too large.');
  });

  it('sends security headers', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('allows CORS only for the web origin, with credentials', async () => {
    const allowed = await request(app.getHttpServer())
      .options('/api/v1/health')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');

    const foreign = await request(app.getHttpServer())
      .options('/api/v1/health')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'GET');
    expect(foreign.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('marks responses no-store unless a route opts into public caching', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.headers['cache-control']).toBe('no-store');
  });
});
