import { Controller, Get, Post } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { ApiError } from '@campus/contracts';

import { trustProxySetting } from '#src/app.factory.js';
import { AppModule } from '#src/app.module.js';
import { RateLimit } from '#src/common/throttling.js';
import { loadConfig } from '#src/config/app-config.js';
import { TEST_WEB_ORIGIN, testEnv } from '#test/fixtures/env.js';

// Stand-ins for the login and inquiry routes, so the policies are tested on their own.
@Controller('probe')
class ProbeController {
  @Post('login')
  @RateLimit('login')
  login(): { ok: true } {
    return { ok: true };
  }

  @Post('inquiry')
  @RateLimit('inquiry')
  inquiry(): { ok: true } {
    return { ok: true };
  }

  @Get('open')
  open(): { ok: true } {
    return { ok: true };
  }
}

async function appWithLimits(limits: {
  default?: number;
  login?: number;
  inquiry?: number;
}): Promise<NestExpressApplication> {
  const config = loadConfig(
    testEnv({
      THROTTLE_DEFAULT_LIMIT: String(limits.default ?? 10_000),
      THROTTLE_LOGIN_LIMIT: String(limits.login ?? 10_000),
      THROTTLE_INQUIRY_LIMIT: String(limits.inquiry ?? 10_000),
    }),
  );
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule.forRoot(config)],
    controllers: [ProbeController],
  }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>();
  app.set('trust proxy', trustProxySetting(config.env.TRUST_PROXY));
  await app.init();
  return app;
}

describe('Throttling', () => {
  describe('the login policy (5/min/IP)', () => {
    let app: NestExpressApplication;

    beforeAll(async () => {
      app = await appWithLimits({ login: 5 });
    });

    afterAll(async () => {
      await app.close();
    });

    it('blocks the 6th attempt in a minute with 429 RATE_LIMITED and Retry-After', async () => {
      const ip = '203.0.113.10';
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/probe/login')
          .set('Origin', TEST_WEB_ORIGIN)
          .set('X-Forwarded-For', ip)
          .expect(201);
      }
      const res = await request(app.getHttpServer())
        .post('/probe/login')
        .set('Origin', TEST_WEB_ORIGIN)
        .set('X-Forwarded-For', ip)
        .expect(429);

      const { error } = ApiError.parse(res.body);
      expect(error.code).toBe('RATE_LIMITED');
      const retryAfter = Number(res.headers['retry-after']);
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(60);
      expect(error.message).toContain(`${retryAfter} second`);
      expect(res.headers['cache-control']).toBe('no-store');
      // Policy names stay internal.
      expect(Object.keys(res.headers).filter((h) => /ratelimit|retry-after-/i.test(h))).toEqual([]);
    });

    it('counts each client IP (from a trusted proxy) separately', async () => {
      await request(app.getHttpServer())
        .post('/probe/login')
        .set('Origin', TEST_WEB_ORIGIN)
        .set('X-Forwarded-For', '203.0.113.99')
        .expect(201);
    });

    it('leaves other policies and unmarked routes alone', async () => {
      const ip = '203.0.113.10'; // Blocked for login by the first test.
      await request(app.getHttpServer())
        .post('/probe/inquiry')
        .set('Origin', TEST_WEB_ORIGIN)
        .set('X-Forwarded-For', ip)
        .expect(201);
      await request(app.getHttpServer()).get('/probe/open').set('X-Forwarded-For', ip).expect(200);
    });
  });

  it('applies the inquiry policy to its own routes', async () => {
    const app = await appWithLimits({ inquiry: 2 });
    try {
      const server = app.getHttpServer();
      await request(server).post('/probe/inquiry').set('Origin', TEST_WEB_ORIGIN).expect(201);
      await request(server).post('/probe/inquiry').set('Origin', TEST_WEB_ORIGIN).expect(201);
      await request(server).post('/probe/inquiry').set('Origin', TEST_WEB_ORIGIN).expect(429);
      await request(server).post('/probe/login').set('Origin', TEST_WEB_ORIGIN).expect(201);
    } finally {
      await app.close();
    }
  });

  it('applies the default limit to every route', async () => {
    const app = await appWithLimits({ default: 2 });
    try {
      const server = app.getHttpServer();
      await request(server).get('/probe/open').expect(200);
      await request(server).get('/probe/open').expect(200);
      const res = await request(server).get('/probe/open').expect(429);
      expect(res.headers['retry-after']).toBeDefined();
    } finally {
      await app.close();
    }
  });
});
