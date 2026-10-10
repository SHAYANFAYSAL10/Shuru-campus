// Vercel serverless entry point (apps/api/vercel.json). The handler lives in src/vercel.ts;
// `npm run build:serverless` compiles and bundles it into one file, because Vercel's runtime
// can't require() ES modules (scripts/bundle-serverless.mjs). Long-running hosts (Docker,
// `npm start`) use src/main.ts instead.
export { default } from '../dist/serverless/handler.mjs';
