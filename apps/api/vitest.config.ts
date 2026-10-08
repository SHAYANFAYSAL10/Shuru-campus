import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// Mirrors package.json "imports" (#src → src at test time; Node maps it to dist at runtime).
const alias = [
  { find: /^#src\/(.*)\.js$/, replacement: fileURLToPath(new URL('./src/$1.ts', import.meta.url)) },
  {
    find: /^#test\/(.*)\.js$/,
    replacement: fileURLToPath(new URL('./test/$1.ts', import.meta.url)),
  },
];

export default defineConfig({
  resolve: { alias },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    env: { TZ: process.env.TZ ?? 'America/Los_Angeles' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // main.ts only reads the env and listens; everything it calls is covered via createApp.
      exclude: ['src/**/*.spec.ts', 'src/main.ts'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 80 },
    },
  },
});
