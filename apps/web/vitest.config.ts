import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Deliberately not Asia/Dhaka, so timezone leaks in date logic fail locally too.
    env: { TZ: process.env.TZ ?? 'America/Los_Angeles' },
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/lib/api/**'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 80 },
    },
  },
});
