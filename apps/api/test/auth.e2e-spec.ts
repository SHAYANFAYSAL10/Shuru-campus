import { type NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { ApiError, AuthSession } from '@campus/contracts';

import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_WEB_ORIGIN } from '#test/fixtures/env.js';
import { createTestApp } from '#test/helpers/test-app.js';

const credentials = { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD };

function setCookies(res: request.Response): string[] {
  const header: unknown = res.headers['set-cookie'];
  return Array.isArray(header) ? header.map(String) : [];
}

function sessionCookie(res: request.Response): string {
  const cookie = setCookies(res).find((c) => c.startsWith('admin_session='));
  if (!cookie) throw new Error('No admin_session cookie set');
  return cookie;
}

/** `name=value` from a Set-Cookie header, ready for a Cookie header. */
function cookiePair(setCookie: string): string {
  return setCookie.split(';')[0] ?? '';
}

describe('Auth endpoints', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  function login(body: object) {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Origin', TEST_WEB_ORIGIN)
      .send(body);
  }

  describe('POST /api/v1/auth/login', () => {
    it('signs in the admin and sets a hardened session cookie', async () => {
      const res = await login(credentials).expect(200);
      expect(AuthSession.parse(res.body)).toEqual({
        user: { email: TEST_ADMIN_EMAIL, role: 'admin' },
      });
      const cookie = sessionCookie(res);
      expect(cookie).toMatch(/; HttpOnly/i);
      expect(cookie).toMatch(/; SameSite=Lax/i);
      expect(cookie).toMatch(/; Path=\//i);
      expect(cookie).toMatch(/; Max-Age=28800/i);
      // Not Secure outside production, so local http works.
      expect(cookie).not.toMatch(/; Secure/i);
      expect(res.headers['cache-control']).toBe('no-store');
    });

    it('accepts the email in any case', async () => {
      await login({ ...credentials, email: 'ADMIN@example.com' }).expect(200);
    });

    it('rejects a wrong email and a wrong password with the same 401', async () => {
      const wrongEmail = await login({ ...credentials, email: 'nobody@example.com' }).expect(401);
      const wrongPassword = await login({ ...credentials, password: 'nope-nope-nope' }).expect(401);
      const a = ApiError.parse(wrongEmail.body).error;
      const b = ApiError.parse(wrongPassword.body).error;
      expect(a.code).toBe('UNAUTHENTICATED');
      expect(a.message).toBe('Invalid email or password.');
      expect(b.message).toBe(a.message);
      expect(setCookies(wrongEmail)).toEqual([]);
      expect(setCookies(wrongPassword)).toEqual([]);
    });

    it('rejects a malformed body with 400 VALIDATION_FAILED', async () => {
      const res = await login({ email: 'not-an-email' }).expect(400);
      expect(ApiError.parse(res.body).error.details?.map((d) => d.path)).toEqual([
        'email',
        'password',
      ]);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns the user for a valid session', async () => {
      const cookie = cookiePair(sessionCookie(await login(credentials)));
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', cookie)
        .expect(200);
      expect(AuthSession.parse(res.body).user.email).toBe(TEST_ADMIN_EMAIL);
      expect(res.headers['cache-control']).toBe('no-store');
    });

    it('returns 401 without a session', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
      expect(ApiError.parse(res.body).error).toMatchObject({
        code: 'UNAUTHENTICATED',
        message: 'Sign in to continue.',
      });
    });

    it('returns 401 for a tampered session', async () => {
      const cookie = cookiePair(sessionCookie(await login(credentials)));
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', `${cookie.slice(0, -2)}xx`)
        .expect(401);
      expect(ApiError.parse(res.body).error.message).toBe(
        'Your session has expired. Sign in again.',
      );
    });

    it('returns 401 once the session expires', async () => {
      const cookie = cookiePair(sessionCookie(await login(credentials)));
      vi.useFakeTimers({ toFake: ['Date'] });
      try {
        vi.setSystemTime(Date.now() + 8 * 3600 * 1000 + 1000);
        await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', cookie).expect(401);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('returns 204 and clears the cookie with the same attributes', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Origin', TEST_WEB_ORIGIN)
        .expect(204);
      const cleared = sessionCookie(res);
      expect(cleared).toMatch(/^admin_session=;/);
      expect(cleared).toMatch(/Expires=Thu, 01 Jan 1970/);
      expect(cleared).toMatch(/; HttpOnly/i);
      expect(cleared).toMatch(/; Path=\//i);
    });
  });

  describe('Origin check on mutations', () => {
    it('rejects a login from a foreign Origin with 403 FORBIDDEN', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Origin', 'https://evil.example')
        .send(credentials)
        .expect(403);
      expect(ApiError.parse(res.body).error.code).toBe('FORBIDDEN');
      expect(setCookies(res)).toEqual([]);
    });

    it('rejects a mutation with no Origin or Referer', async () => {
      await request(app.getHttpServer()).post('/api/v1/auth/logout').expect(403);
    });

    it('accepts a same-site Referer when Origin is absent', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Referer', `${TEST_WEB_ORIGIN}/admin`)
        .expect(204);
    });
  });
});

describe('Auth in production', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp({ NODE_ENV: 'production', LOG_LEVEL: 'silent' }));
  });

  afterAll(async () => {
    await app.close();
  });

  it('marks the session cookie Secure', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Origin', TEST_WEB_ORIGIN)
      .send(credentials)
      .expect(200);
    expect(sessionCookie(res)).toMatch(/; Secure/i);
  });
});

describe('Login throttling', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp({ THROTTLE_LOGIN_LIMIT: '5' }));
  });

  afterAll(async () => {
    await app.close();
  });

  it('blocks the 6th attempt in a minute with 429 and Retry-After', async () => {
    const attempt = () =>
      request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Origin', TEST_WEB_ORIGIN)
        .send({ ...credentials, password: 'wrong-password' });
    for (let i = 0; i < 5; i++) await attempt().expect(401);
    const res = await attempt().expect(429);
    expect(ApiError.parse(res.body).error.code).toBe('RATE_LIMITED');
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
  });
});
