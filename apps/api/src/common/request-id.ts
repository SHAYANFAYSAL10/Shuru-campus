import { randomUUID } from 'node:crypto';

import { type NextFunction, type Request, type Response } from 'express';

export const REQUEST_ID_HEADER = 'X-Request-Id';

/** Incoming IDs are reused (so the web app can correlate logs) only when they look sane. */
const SAFE_ID = /^[\w-]{8,64}$/;

/** The request's ID (always a string: `requestId` sets it before anything else runs). */
export function requestIdOf(req: { id?: unknown }): string {
  return typeof req.id === 'string' ? req.id : '';
}

/** Gives every request an ID (`req.id`) and echoes it as `X-Request-Id` on every response. */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers['x-request-id'];
  const id = typeof incoming === 'string' && SAFE_ID.test(incoming) ? incoming : randomUUID();
  req.id = id;
  res.setHeader(REQUEST_ID_HEADER, id);
  next();
}
