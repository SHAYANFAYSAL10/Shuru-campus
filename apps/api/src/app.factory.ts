import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { jsonBody } from './common/json-body.js';
import { type LoggerOptions } from './common/logger.js';
import { setupOpenApi } from './common/openapi.js';
import { REQUEST_ID_HEADER, requestId } from './common/request-id.js';
import { type AppConfig } from './config/app-config.js';

export const API_PREFIX = 'api/v1';

/** Express `trust proxy` from the env string: `true`/`false`, a hop count, or subnet names/CIDRs. */
export function trustProxySetting(value: string): boolean | number | string {
  if (value === 'true' || value === 'false') return value === 'true';
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}

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
  // `req.ip` (the rate-limit key) is the forwarded client IP only from trusted hops.
  app.set('trust proxy', trustProxySetting(config.env.TRUST_PROXY));

  // Runs before Nest's own middleware, so even router 404s carry a request ID.
  app.use(requestId);
  app.use(helmet());
  app.use(jsonBody());
  app.use(cookieParser());
  app.enableCors({
    origin: config.env.WEB_ORIGINS,
    credentials: true,
    exposedHeaders: [REQUEST_ID_HEADER, 'Retry-After'],
  });
  app.setGlobalPrefix(API_PREFIX);
  // API docs are a development aid; production never exposes them.
  if (!config.isProduction) setupOpenApi(app, config);
  app.enableShutdownHooks();
  return app;
}
