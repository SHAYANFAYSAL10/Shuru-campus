import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Inject,
  Logger,
} from '@nestjs/common';
import { type Request, type Response } from 'express';

import { type ApiError, ERROR_STATUS, type ErrorCode } from '@campus/contracts';

import { APP_CONFIG, type AppConfig } from '#src/config/app-config.js';

import { ApiException } from './api-exception.js';
import { NO_STORE } from './cache-control.js';
import { requestIdOf } from './request-id.js';

const CODE_BY_STATUS = new Map<number, ErrorCode>(
  Object.entries(ERROR_STATUS).map(([code, status]) => [status, code as ErrorCode]),
);

/** Messages for errors raised outside our code (router 404, Nest built-ins). */
const DEFAULT_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_FAILED: 'The request is invalid.',
  UNAUTHENTICATED: 'Sign in to continue.',
  FORBIDDEN: "You don't have access to this.",
  NOT_FOUND: 'Nothing here.',
  RATE_LIMITED: 'Too many requests. Try again shortly.',
  INTERNAL: 'Something went wrong on our side. Please try again.',
};

interface Rendered {
  status: number;
  code: ErrorCode;
  message: string;
  details?: ApiError['error']['details'];
  headers: Record<string, string>;
}

/** Renders every error as the `ApiError` shape (docs/06-api.md). Never leaks stacks. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const rendered = this.render(exception);

    const body: ApiError = {
      error: {
        code: rendered.code,
        message: rendered.message,
        ...(rendered.details ? { details: rendered.details } : {}),
        requestId: requestIdOf(req),
      },
    };
    res.setHeader('Cache-Control', NO_STORE);
    for (const [name, value] of Object.entries(rendered.headers)) res.setHeader(name, value);
    res.status(rendered.status).json(body);
  }

  private render(exception: unknown): Rendered {
    if (exception instanceof ApiException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
        headers: exception.headers,
      };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code = CODE_BY_STATUS.get(status) ?? (status < 500 ? 'VALIDATION_FAILED' : 'INTERNAL');
      return { status, code, message: DEFAULT_MESSAGES[code], headers: {} };
    }
    this.logger.error(exception);
    const internal = exception instanceof Error ? exception.message : String(exception);
    return {
      status: 500,
      code: 'INTERNAL',
      // Internal messages help locally; production never shows them.
      message: this.config.isProduction ? DEFAULT_MESSAGES.INTERNAL : `Internal error: ${internal}`,
      headers: {},
    };
  }
}
