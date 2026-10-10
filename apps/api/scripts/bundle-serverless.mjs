// Bundles dist/vercel.js into one ESM file for the Vercel function (api/index.js).
// Vercel's runtime can't require() ES modules, and CJS packages such as @nestjs/throttler
// require() the ESM-only @nestjs/common. Bundling resolves those requires at build time.
// Run after `nest build` (`npm run build:serverless` does both).
import { fileURLToPath } from 'node:url';

import { rolldown } from 'rolldown';

const path = (rel) => fileURLToPath(new URL(`../${rel}`, import.meta.url));

const bundle = await rolldown({
  input: path('dist/vercel.js'),
  platform: 'node',
  // argon2 loads a native binary; Vercel's tracer copies it from node_modules.
  external: ['argon2'],
  onLog(level, log, handler) {
    // Nest's optional integrations (microservices, websockets, class-validator…) are
    // require()d lazily inside try/catch; left unresolved, they stay absent at runtime.
    if (log.code === 'UNRESOLVED_IMPORT') return;
    handler(level, log);
  },
});

// Two levels below apps/api, like dist/config/app-config.js, so its
// `new URL('../../package.json', import.meta.url)` still finds apps/api/package.json.
await bundle.write({
  file: path('dist/serverless/handler.mjs'),
  format: 'esm',
  codeSplitting: false,
});
await bundle.close();
process.stdout.write('✔ bundled dist/serverless/handler.mjs\n');
