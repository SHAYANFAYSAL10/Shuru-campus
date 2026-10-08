import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { type Request } from 'express';

import { APP_CONFIG, type AppConfig } from '#src/config/app-config.js';

import { ApiException } from './api-exception.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** The browser origin of a request: `Origin`, else the origin of `Referer`. */
export function requestOrigin(req: Pick<Request, 'headers'>): string | undefined {
  const { origin, referer } = req.headers;
  if (origin && origin !== 'null') return origin;
  if (!referer) return undefined;
  try {
    return new URL(referer).origin;
  } catch {
    return undefined;
  }
}

/**
 * CSRF defense (docs/03-architecture.md → Security): every mutation must come from one of
 * `WEB_ORIGINS`. Browsers always send `Origin` on cross-site POSTs; server-side callers
 * (the web app's API client) send it explicitly.
 */
@Injectable()
export class OriginGuard implements CanActivate {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(req.method)) return true;
    const origin = requestOrigin(req);
    if (origin && this.config.env.WEB_ORIGINS.includes(origin)) return true;
    throw new ApiException('FORBIDDEN', 'This request must come from the website.');
  }
}
