import { type CookieOptions, type Request } from 'express';

import { type AppConfig } from '#src/config/app-config.js';

/** Brand-neutral on purpose (docs/03-architecture.md → Brand configuration). */
export const SESSION_COOKIE = 'admin_session';

/** `HttpOnly; Secure (prod); SameSite=Lax; Path=/` (docs/03-architecture.md → Security). */
export function sessionCookieOptions(config: AppConfig): CookieOptions {
  return { httpOnly: true, secure: config.isProduction, sameSite: 'lax', path: '/' };
}

export function sessionTokenOf(req: Request): string | undefined {
  const cookies: unknown = req.cookies;
  if (typeof cookies !== 'object' || cookies === null) return undefined;
  const token = (cookies as Record<string, unknown>)[SESSION_COOKIE];
  return typeof token === 'string' && token.length > 0 ? token : undefined;
}
