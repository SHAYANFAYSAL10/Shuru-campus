import { defineConfig, devices } from '@playwright/test';

// End-to-end and responsive suite (docs/08-testing.md). Runs a production build of the web app
// against the API on seed data. This is the starter matrix for the public pages (M5): Chromium
// only, at the widths the Definition of Done checks by hand plus the edge cases. T8.1 completes
// the device matrix (WebKit, Firefox, iPhone, iPad, 1440 and 2560) and CI sharding.

const CI = Boolean(process.env.CI);
// Locally, servers already on these ports are reused. Set other ports to test a fresh build
// beside running dev servers: E2E_WEB_PORT=3100 E2E_API_PORT=4100 npm run test:e2e
const WEB_PORT = process.env.E2E_WEB_PORT ?? '3000';
const API_PORT = process.env.E2E_API_PORT ?? '4000';
const WEB_URL = `http://localhost:${WEB_PORT}`;
const API_URL = `http://localhost:${API_PORT}`;

/** The API's test environment (apps/api/test/fixtures/env.ts): fixed secrets, raised limits. */
const API_ENV = {
  NODE_ENV: 'test',
  PORT: API_PORT,
  WEB_ORIGINS: WEB_URL,
  JWT_SECRET: 'test-secret-that-is-at-least-32-bytes-long',
  ADMIN_EMAIL: 'admin@example.com',
  // argon2id of the test password `test-password-123`.
  ADMIN_PASSWORD_HASH:
    '$argon2id$v=19$m=65536,p=4,t=3$UgB9nfXkhY3hQymNSo/RNg$FASV5IJ9USa+VtgjnFwXM95CUl9K1uSHuyeM4BvAsm4',
  LOG_LEVEL: 'warn',
  THROTTLE_DEFAULT_LIMIT: '10000',
  THROTTLE_LOGIN_LIMIT: '10000',
  THROTTLE_INQUIRY_LIMIT: '10000',
};

const touch = { hasTouch: true, isMobile: true } as const;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: WEB_URL,
    // Dhaka is the business's clock; tests that depend on the time mock it explicitly.
    timezoneId: 'Asia/Dhaka',
    locale: 'en-GB',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-xs',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 568 }, ...touch },
    },
    { name: 'mobile-android', use: { ...devices['Pixel 7'] } },
    {
      name: 'mobile-landscape',
      use: { ...devices['Desktop Chrome'], viewport: { width: 844, height: 390 }, ...touch },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, ...touch },
    },
    {
      name: 'laptop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'wide',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    // 200% zoom: the 1280×800 screen at device scale 2 lays out at 640×400 CSS px.
    {
      name: 'zoom-200',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 640, height: 400 },
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: [
    {
      command: 'npm run build -w @campus/api && npm run start -w @campus/api',
      cwd: '../..',
      url: `${API_URL}/api/v1/health`,
      env: API_ENV,
      reuseExistingServer: !CI,
      timeout: 180_000,
    },
    {
      command: `npm run build && npx next start --port ${WEB_PORT}`,
      url: WEB_URL,
      env: { API_ORIGIN: API_URL, NEXT_PUBLIC_SITE_URL: WEB_URL },
      reuseExistingServer: !CI,
      timeout: 300_000,
    },
  ],
});
