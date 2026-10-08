import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    env: { TZ: process.env.TZ ?? 'America/Los_Angeles' },
  },
});
