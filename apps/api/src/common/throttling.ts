import { type ExecutionContext, Injectable, Module, SetMetadata } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  type ThrottlerLimitDetail,
  ThrottlerModule,
  type ThrottlerModuleOptions,
} from '@nestjs/throttler';

import { APP_CONFIG, type AppConfig } from '#src/config/app-config.js';

import { ApiException } from './api-exception.js';

/** Stricter limits that routes opt into with `@RateLimit()` (docs/03-architecture.md → Security). */
export type RateLimitPolicy = 'login' | 'inquiry';

const RATE_LIMIT_KEY = 'campus:rate-limit';
const WINDOW_MS = 60_000;

/** Applies the named per-IP limit on top of the global default. */
export const RateLimit = (policy: RateLimitPolicy): MethodDecorator & ClassDecorator =>
  SetMetadata(RATE_LIMIT_KEY, policy);

const reflector = new Reflector();

function policyOf(context: ExecutionContext): RateLimitPolicy | undefined {
  return reflector.getAllAndOverride<RateLimitPolicy | undefined>(RATE_LIMIT_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
}

/** Every limit is per IP per minute and comes from the env, so tests can lower or raise it. */
export function throttlerOptions({ env }: AppConfig): ThrottlerModuleOptions {
  const named = (name: RateLimitPolicy, limit: number) => ({
    name,
    limit,
    ttl: WINDOW_MS,
    skipIf: (context: ExecutionContext) => policyOf(context) !== name,
  });
  return {
    // `X-RateLimit-*` and `Retry-After-<name>` headers would expose policy names. The
    // contract only promises `Retry-After` on a 429, which the guard sets below.
    setHeaders: false,
    throttlers: [
      { name: 'default', limit: env.THROTTLE_DEFAULT_LIMIT, ttl: WINDOW_MS },
      named('login', env.THROTTLE_LOGIN_LIMIT),
      named('inquiry', env.THROTTLE_INQUIRY_LIMIT),
    ],
  };
}

export function retryMessage(seconds: number): string {
  return `Too many requests. Please try again in ${seconds} second${seconds === 1 ? '' : 's'}.`;
}

/** Renders a blocked request as `429 RATE_LIMITED` with `Retry-After` (docs/06-api.md). */
@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
  protected override throwThrottlingException(
    _context: ExecutionContext,
    { timeToBlockExpire }: ThrottlerLimitDetail,
  ): Promise<void> {
    const seconds = Math.max(1, Math.ceil(timeToBlockExpire));
    throw new ApiException('RATE_LIMITED', retryMessage(seconds), undefined, {
      'Retry-After': String(seconds),
    });
  }
}

/** Global rate limiting. Import once, in the root module. */
@Module({
  imports: [ThrottlerModule.forRootAsync({ useFactory: throttlerOptions, inject: [APP_CONFIG] })],
  providers: [{ provide: APP_GUARD, useClass: ApiThrottlerGuard }],
})
export class ThrottlingModule {}
