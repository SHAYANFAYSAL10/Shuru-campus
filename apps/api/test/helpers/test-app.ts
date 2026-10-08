import { Writable } from 'node:stream';

import { type NestExpressApplication } from '@nestjs/platform-express';
import { type LevelWithSilent } from 'pino';

import { createApp } from '#src/app.factory.js';
import { loadConfig } from '#src/config/app-config.js';
import { testEnv } from '#test/fixtures/env.js';

export interface TestApp {
  app: NestExpressApplication;
  /** Raw log lines (only captured when `logLevel` is set). */
  logs: string[];
}

/** Boots the real app (same factory as production) against a test environment. */
export async function createTestApp(
  env: Parameters<typeof testEnv>[0] = {},
  { logLevel }: { logLevel?: LevelWithSilent } = {},
): Promise<TestApp> {
  const logs: string[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      logs.push(chunk.toString());
      callback();
    },
  });
  const app = await createApp(
    loadConfig(testEnv(env)),
    logLevel ? { logger: { stream, level: logLevel } } : {},
  );
  await app.init();
  return { app, logs };
}
