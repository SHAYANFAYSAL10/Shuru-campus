import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { jsonBody } from './common/json-body.js';
import { type LoggerOptions } from './common/logger.js';
import { REQUEST_ID_HEADER, requestId } from './common/request-id.js';
import { type AppConfig } from './config/app-config.js';

export const API_PREFIX = 'api/v1';

export interface CreateAppOptions {
  logger?: LoggerOptions;
}

/**
 * Builds the fully configured app without listening. `main.ts` and the integration tests
 * share it, so tests exercise the same middleware, prefix and error handling as production.
 */
export async function createApp(
  config: AppConfig,
  options: CreateAppOptions = {},
): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.forRoot(config, options.logger),
    { bufferLogs: true, abortOnError: false, bodyParser: false },
  );
  app.useLogger(app.get(Logger));

  // Runs before Nest's own middleware, so even router 404s carry a request ID.
  app.use(requestId);
  app.use(helmet());
  app.use(jsonBody());
  app.enableCors({
    origin: config.env.WEB_ORIGINS,
    credentials: true,
    exposedHeaders: [REQUEST_ID_HEADER, 'Retry-After'],
  });
  app.setGlobalPrefix(API_PREFIX);
  app.enableShutdownHooks();
  return app;
}
