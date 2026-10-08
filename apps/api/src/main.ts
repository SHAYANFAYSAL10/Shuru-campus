import 'reflect-metadata';

import { existsSync } from 'node:fs';

import { createApp } from './app.factory.js';
import { ConfigError, loadConfig, type AppConfig } from './config/app-config.js';

function configOrExit(): AppConfig {
  // Local convenience: read apps/api/.env when present. Real environments set variables directly.
  if (process.env.NODE_ENV !== 'production' && existsSync('.env')) process.loadEnvFile('.env');
  try {
    return loadConfig(process.env);
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
    process.stderr.write(
      `\n✖ ${error.message}\n\nSee apps/api/.env.example and docs/03-architecture.md.\n\n`,
    );
    process.exit(1);
  }
}

const config = configOrExit();
const app = await createApp(config);
await app.listen(config.env.PORT);
