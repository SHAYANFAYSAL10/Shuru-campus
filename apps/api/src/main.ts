import 'reflect-metadata';

import { existsSync } from 'node:fs';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
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

async function bootstrap(): Promise<void> {
  const config = configOrExit();
  const app = await NestFactory.create(AppModule.forRoot(config));
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  await app.listen(config.env.PORT);
}

await bootstrap();
