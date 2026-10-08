import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { type Request } from 'express';

import { type AuthUser } from '@campus/contracts';

import { ApiException } from '#src/common/api-exception.js';

import { AuthService } from './auth.service.js';
import { sessionTokenOf } from './session-cookie.js';

const sessions = new WeakMap<Request, AuthUser>();

/** The admin a request was authenticated as. Only valid behind `AdminGuard`. */
export function adminUserOf(req: Request): AuthUser {
  const user = sessions.get(req);
  if (!user) throw new Error('adminUserOf() used on a route without AdminGuard');
  return user;
}

/** Requires a valid `admin_session` JWT (docs/03-architecture.md → Guarding). */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = sessionTokenOf(req);
    if (!token) throw new ApiException('UNAUTHENTICATED', 'Sign in to continue.');
    const user = await this.auth.verifyToken(token);
    if (!user) {
      throw new ApiException('UNAUTHENTICATED', 'Your session has expired. Sign in again.');
    }
    sessions.set(req, user);
    return true;
  }
}
