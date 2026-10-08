import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { type App } from 'supertest/types.js';

import { HealthResponse } from '@campus/contracts';

import { AppModule } from '../src/app.module.js';

describe('GET /api/v1/health', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a payload matching the HealthResponse contract', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(HealthResponse.parse(res.body)).toMatchObject({ status: 'ok', dataSource: 'memory' });
  });
});
