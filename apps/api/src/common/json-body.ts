import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';

import { ApiException } from './api-exception.js';

const MESSAGES: Record<string, string> = {
  'entity.parse.failed': "The request body isn't valid JSON.",
  'entity.too.large': 'The request body is too large.',
  'encoding.unsupported': 'Send the request body as UTF-8.',
  'charset.unsupported': 'Send the request body as UTF-8.',
};

/**
 * JSON-only body parser (Nest's default parser is disabled). Parser failures become
 * `400 VALIDATION_FAILED` with a message that says what went wrong, instead of a 500.
 */
export function jsonBody(limit = '100kb'): RequestHandler {
  const parse = express.json({ limit });
  return (req: Request, res: Response, next: NextFunction) => {
    parse(req, res, (error?: unknown) => {
      if (error === undefined) {
        next();
        return;
      }
      const type =
        typeof error === 'object' && error !== null && 'type' in error ? String(error.type) : '';
      next(new ApiException('VALIDATION_FAILED', MESSAGES[type] ?? 'The request body is invalid.'));
    });
  };
}
