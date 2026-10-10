import 'reflect-metadata';

import { type IncomingMessage, type ServerResponse } from 'node:http';

import { createApp } from './app.factory.js';
import { loadConfig } from './config/app-config.js';

type Listener = (req: IncomingMessage, res: ServerResponse) => void;
type Handler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

/**
 * Serverless entry (test deployments on Vercel, docs/03-architecture.md). Boots the same
 * `createApp()` as `main.ts` on the first request and reuses it while the instance stays
 * warm. A failed boot (e.g. an invalid env) isn't cached, so the next request retries.
 */
export function createServerlessHandler(
  readEnv: () => Record<string, string | undefined> = () => process.env,
): Handler {
  let server: Promise<Listener> | undefined;

  async function boot(): Promise<Listener> {
    const app = await createApp(loadConfig(readEnv()));
    await app.init();
    return app.getHttpAdapter().getInstance();
  }

  return async (req, res) => {
    server ??= boot().catch((error: unknown) => {
      server = undefined;
      throw error;
    });
    const listener = await server;
    listener(req, res);
  };
}

export default createServerlessHandler();
