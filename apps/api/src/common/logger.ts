import { type IncomingMessage, type ServerResponse } from 'node:http';

import { type DestinationStream, type LevelWithSilent } from 'pino';
import { type Options } from 'pino-http';

import { type AppConfig } from '#src/config/app-config.js';

import { requestIdOf } from './request-id.js';

/**
 * Never log secrets or personal details (CLAUDE.md §4). Request and response serializers
 * already drop headers and bodies; these paths are the safety net for anything we log
 * ourselves.
 */
export const REDACT_PATHS = [
  'email',
  'phone',
  'password',
  '*.email',
  '*.phone',
  '*.password',
  'req.headers.cookie',
  'req.headers.authorization',
  'res.headers["set-cookie"]',
];

export interface LoggerOptions {
  /** Write logs here instead of stdout (tests capture them). */
  stream?: DestinationStream;
  level?: LevelWithSilent;
}

function defaultLevel(config: AppConfig): LevelWithSilent {
  if (config.env.LOG_LEVEL) return config.env.LOG_LEVEL;
  return { development: 'debug', test: 'silent', production: 'info' }[
    config.env.NODE_ENV
  ] as LevelWithSilent;
}

export function pinoHttpOptions(config: AppConfig, options: LoggerOptions = {}): Options {
  const pretty = config.env.NODE_ENV === 'development' && options.stream === undefined;
  return {
    level: options.level ?? defaultLevel(config),
    genReqId: (req: IncomingMessage) => requestIdOf(req),
    redact: { paths: REDACT_PATHS, censor: '[redacted]' },
    serializers: {
      req: (req: { id: unknown; method: string; url: string }) => ({
        id: req.id,
        method: req.method,
        url: req.url,
      }),
      res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
    },
    customLogLevel: (_req: IncomingMessage, res: ServerResponse, error?: Error) => {
      if (error || res.statusCode >= 500) return 'error';
      return res.statusCode >= 400 ? 'warn' : 'info';
    },
    ...(pretty ? { transport: { target: 'pino-pretty', options: { singleLine: true } } } : {}),
  };
}
