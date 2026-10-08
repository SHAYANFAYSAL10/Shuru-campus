import { type ExecutionContext } from '@nestjs/common';

import { loadConfig } from '#src/config/app-config.js';
import { TEST_WEB_ORIGIN, testEnv } from '#test/fixtures/env.js';

import { ApiException } from './api-exception.js';
import { OriginGuard, requestOrigin } from './origin.guard.js';

function contextFor(method: string, headers: Record<string, string> = {}): ExecutionContext {
  const req = { method, headers };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

describe('requestOrigin', () => {
  it('prefers Origin, falls back to the origin of Referer', () => {
    expect(requestOrigin({ headers: { origin: 'https://a.example' } })).toBe('https://a.example');
    expect(requestOrigin({ headers: { referer: 'https://b.example/contact?x=1' } })).toBe(
      'https://b.example',
    );
    expect(requestOrigin({ headers: { origin: 'null', referer: 'https://b.example/' } })).toBe(
      'https://b.example',
    );
  });

  it('returns undefined without usable headers', () => {
    expect(requestOrigin({ headers: {} })).toBeUndefined();
    expect(requestOrigin({ headers: { referer: 'not a url' } })).toBeUndefined();
  });
});

describe('OriginGuard', () => {
  const guard = new OriginGuard(loadConfig(testEnv()));

  it('lets safe methods through without an Origin', () => {
    for (const method of ['GET', 'HEAD', 'OPTIONS']) {
      expect(guard.canActivate(contextFor(method))).toBe(true);
    }
  });

  it('allows mutations from a web origin', () => {
    expect(guard.canActivate(contextFor('POST', { origin: TEST_WEB_ORIGIN }))).toBe(true);
    expect(guard.canActivate(contextFor('PUT', { referer: `${TEST_WEB_ORIGIN}/admin` }))).toBe(
      true,
    );
  });

  it.each([
    ['a foreign Origin', { origin: 'https://evil.example' }],
    ['a look-alike Origin', { origin: `${TEST_WEB_ORIGIN}.evil.example` }],
    ['no Origin or Referer', {}],
  ])('rejects a mutation with %s as 403 FORBIDDEN', (_label, headers) => {
    const run = () => guard.canActivate(contextFor('DELETE', headers));
    expect(run).toThrow(ApiException);
    try {
      run();
    } catch (error) {
      expect((error as ApiException).code).toBe('FORBIDDEN');
    }
  });
});
