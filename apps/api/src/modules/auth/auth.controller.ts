import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type Request, type Response } from 'express';

import { type AuthSession, LoginRequest } from '@campus/contracts';

import { ApiException } from '#src/common/api-exception.js';
import { RateLimit } from '#src/common/throttling.js';
import { ZodValidationPipe } from '#src/common/zod-validation.pipe.js';
import { APP_CONFIG, type AppConfig } from '#src/config/app-config.js';

import { AdminGuard, adminUserOf } from './admin.guard.js';
import { AuthService } from './auth.service.js';
import { SESSION_COOKIE, sessionCookieOptions } from './session-cookie.js';

/** One message for every credential failure, so it never reveals which part was wrong. */
export const INVALID_CREDENTIALS = 'Invalid email or password.';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit('login')
  async login(
    @Body(new ZodValidationPipe(LoginRequest)) { email, password }: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSession> {
    const user = await this.auth.verifyCredentials(email, password);
    if (!user) throw new ApiException('UNAUTHENTICATED', INVALID_CREDENTIALS);
    res.cookie(SESSION_COOKIE, await this.auth.issueToken(user), {
      ...sessionCookieOptions(this.config),
      maxAge: this.config.env.JWT_TTL * 1000,
    });
    return { user };
  }

  /** Always succeeds, so a stale or missing session can still sign out cleanly. */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions(this.config));
  }

  @Get('me')
  @UseGuards(AdminGuard)
  me(@Req() req: Request): AuthSession {
    return { user: adminUserOf(req) };
  }
}
