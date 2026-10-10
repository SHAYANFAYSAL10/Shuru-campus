// Vercel serverless entry point (apps/api/vercel.json). Runs the compiled app from `dist/`,
// built once per cold start and reused while the instance stays warm. Long-running hosts
// (Docker, `npm start`) use src/main.ts instead.
import 'reflect-metadata';

import { createApp } from '../dist/app.factory.js';
import { loadConfig } from '../dist/config/app-config.js';

/** @type {Promise<import('express').Express> | undefined} */
let server;

async function boot() {
  const app = await createApp(loadConfig(process.env));
  await app.init();
  return app.getHttpAdapter().getInstance();
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
export default async function handler(req, res) {
  server ??= boot().catch((error) => {
    // Retry on the next request rather than caching a failed boot (e.g. a bad env var).
    server = undefined;
    throw error;
  });
  const app = await server;
  app(req, res);
}
