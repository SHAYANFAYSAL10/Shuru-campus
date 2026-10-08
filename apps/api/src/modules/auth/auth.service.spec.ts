import { SignJWT } from 'jose';

import { loadConfig } from '#src/config/app-config.js';
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, testEnv } from '#test/fixtures/env.js';

import { AuthService } from './auth.service.js';

const config = loadConfig(testEnv());
const admin = { email: TEST_ADMIN_EMAIL, role: 'admin' as const };

describe('AuthService', () => {
  const auth = new AuthService(config);

  describe('verifyCredentials', () => {
    it('accepts the env admin, with the email in any case', async () => {
      expect(await auth.verifyCredentials(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD)).toEqual(admin);
      expect(await auth.verifyCredentials('Admin@Example.com', TEST_ADMIN_PASSWORD)).toEqual(admin);
    });

    it('rejects a wrong email or a wrong password', async () => {
      expect(await auth.verifyCredentials('someone@example.com', TEST_ADMIN_PASSWORD)).toBeNull();
      expect(await auth.verifyCredentials(TEST_ADMIN_EMAIL, 'wrong-password')).toBeNull();
    });

    it('rejects everything when the configured hash is unusable', async () => {
      const broken = new AuthService({
        ...config,
        env: { ...config.env, ADMIN_PASSWORD_HASH: '$argon2id$garbage' },
      });
      expect(await broken.verifyCredentials(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD)).toBeNull();
    });
  });

  describe('tokens', () => {
    it('round-trips a session', async () => {
      expect(await auth.verifyToken(await auth.issueToken(admin))).toEqual(admin);
    });

    it('rejects a missing, malformed or tampered token', async () => {
      const token = await auth.issueToken(admin);
      const [header, payload, signature] = token.split('.');
      const forged = Buffer.from(JSON.stringify({ sub: admin.email, role: 'admin' })).toString(
        'base64url',
      );
      expect(await auth.verifyToken(undefined)).toBeNull();
      expect(await auth.verifyToken('not-a-jwt')).toBeNull();
      expect(await auth.verifyToken(`${header}.${forged}.${signature}`)).toBeNull();
      expect(await auth.verifyToken(`${header}.${payload}.${signature}x`)).toBeNull();
    });

    it('rejects a token signed with another secret', async () => {
      const other = new AuthService({
        ...config,
        env: { ...config.env, JWT_SECRET: 'another-secret-that-is-at-least-32-bytes' },
      });
      expect(await auth.verifyToken(await other.issueToken(admin))).toBeNull();
    });

    it('rejects an expired token', async () => {
      const key = new TextEncoder().encode(config.env.JWT_SECRET);
      const expired = await new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(admin.email)
        .setAudience('campus-admin')
        .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
        .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
        .sign(key);
      expect(await auth.verifyToken(expired)).toBeNull();
    });

    it("rejects a token for someone who isn't the current admin", async () => {
      const renamed = new AuthService({
        ...config,
        env: { ...config.env, ADMIN_EMAIL: 'new-admin@example.com' },
      });
      expect(await renamed.verifyToken(await auth.issueToken(admin))).toBeNull();
    });
  });
});
