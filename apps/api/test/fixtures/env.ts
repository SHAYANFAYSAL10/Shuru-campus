import { type EnvInput } from '#src/config/env.schema.js';

/** The test admin's password (docs/08-testing.md → fixed test credentials). */
export const TEST_ADMIN_PASSWORD = 'test-password-123';
export const TEST_ADMIN_EMAIL = 'admin@example.com';
export const TEST_WEB_ORIGIN = 'http://localhost:3000';

/** A complete, valid test environment. Spread overrides on top. */
export function testEnv(
  overrides: Partial<Record<keyof EnvInput, string | undefined>> = {},
): Record<string, string | undefined> {
  return {
    NODE_ENV: 'test',
    WEB_ORIGINS: TEST_WEB_ORIGIN,
    JWT_SECRET: 'test-secret-that-is-at-least-32-bytes-long',
    ADMIN_EMAIL: TEST_ADMIN_EMAIL,
    // argon2id of TEST_ADMIN_PASSWORD.
    ADMIN_PASSWORD_HASH:
      '$argon2id$v=19$m=65536,p=4,t=3$UgB9nfXkhY3hQymNSo/RNg$FASV5IJ9USa+VtgjnFwXM95CUl9K1uSHuyeM4BvAsm4',
    // Limits are raised so suites never trip them; throttling tests lower them explicitly
    // (docs/08-testing.md → Conventions).
    THROTTLE_DEFAULT_LIMIT: '10000',
    THROTTLE_LOGIN_LIMIT: '10000',
    THROTTLE_INQUIRY_LIMIT: '10000',
    ...overrides,
  };
}
