import { createServer } from 'node:http';

import request from 'supertest';

import { HealthResponse } from '@campus/contracts';

import { testEnv } from '#test/fixtures/env.js';

import { createServerlessHandler } from './vercel.js';

describe('createServerlessHandler', () => {
  it('serves the API through a plain Node request handler', async () => {
    const handler = createServerlessHandler(() => testEnv());
    const server = createServer((req, res) => void handler(req, res));

    const res = await request(server).get('/api/v1/health').expect(200);
    expect(HealthResponse.parse(res.body).status).toBe('ok');
    // Warm requests reuse the booted app.
    await request(server).get('/api/v1/plans').expect(200);
  });

  it('retries the boot after a failure instead of caching it', async () => {
    let env = testEnv({ JWT_SECRET: 'too-short' });
    const handler = createServerlessHandler(() => env);
    const server = createServer((req, res) => {
      handler(req, res).catch(() => {
        res.statusCode = 500;
        res.end();
      });
    });

    await request(server).get('/api/v1/health').expect(500);
    env = testEnv();
    await request(server).get('/api/v1/health').expect(200);
  });
});
