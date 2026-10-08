import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Response, type Request } from 'express';
import { type Observable } from 'rxjs';

export const PUBLIC_CACHE = 'public, max-age=60, stale-while-revalidate=600';
export const NO_STORE = 'no-store';

const PUBLIC_CACHE_KEY = 'campus:public-cache';

/** Marks a public GET as cacheable (docs/06-api.md → Conventions). Everything else is `no-store`. */
export const PublicCache = (): MethodDecorator & ClassDecorator =>
  SetMetadata(PUBLIC_CACHE_KEY, true);

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(PUBLIC_CACHE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const cacheable = isPublic === true && http.getRequest<Request>().method === 'GET';
    http.getResponse<Response>().setHeader('Cache-Control', cacheable ? PUBLIC_CACHE : NO_STORE);
    return next.handle();
  }
}
