import { type NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { HealthResponse } from '@campus/contracts';

import { createTestApp } from '#test/helpers/test-app.js';

describe('GET /api/v1/health', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a payload matching the HealthResponse contract', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    const health = HealthResponse.parse(res.body);
    expect(health).toMatchObject({ status: 'ok', dataSource: 'memory' });
    expect(health.version).toMatch(/^\d+\.\d+\.\d+/);
  });
});
