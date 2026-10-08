import { describe, expect, it } from 'vitest';

import { codeForStatus, fail, ok, toHttpFailure, unwrapOr } from '@/lib/api/result';

describe('codeForStatus', () => {
  it.each([
    [400, 'VALIDATION_FAILED'],
    [401, 'UNAUTHENTICATED'],
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
    [429, 'RATE_LIMITED'],
    [500, 'INTERNAL'],
    [418, 'VALIDATION_FAILED'],
    [502, 'INTERNAL'],
  ] as const)('%i → %s', (status, code) => {
    expect(codeForStatus(status)).toBe(code);
  });
});

describe('toHttpFailure', () => {
  it('synthesizes an error from the status when the body is not an ApiError', () => {
    const failure = toHttpFailure(502, undefined, new Headers({ 'x-request-id': 'abc12345' }));

    expect(failure).toEqual({
      kind: 'http',
      status: 502,
      code: 'INTERNAL',
      message: 'Something went wrong. Please try again.',
      details: [],
      requestId: 'abc12345',
    });
  });

  it('keeps validation details from the API', () => {
    const body = {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Some fields are invalid.',
        details: [{ path: 'email', message: 'Enter a valid email address.' }],
        requestId: 'req-1',
      },
    };

    expect(toHttpFailure(400, body, new Headers()).details).toEqual(body.error.details);
  });

  it('reads Retry-After seconds on 429', () => {
    const failure = toHttpFailure(429, undefined, new Headers({ 'retry-after': '30' }));

    expect(failure).toMatchObject({ code: 'RATE_LIMITED', retryAfterS: 30 });
  });

  it('reads a Retry-After HTTP date on 429', () => {
    const at = new Date(Date.now() + 10_000).toUTCString();
    const failure = toHttpFailure(429, undefined, new Headers({ 'retry-after': at }));

    expect(failure.retryAfterS).toBeGreaterThanOrEqual(9);
    expect(failure.retryAfterS).toBeLessThanOrEqual(10);
  });

  it('ignores a malformed Retry-After, and Retry-After on other statuses', () => {
    const malformed = toHttpFailure(429, undefined, new Headers({ 'retry-after': 'later' }));
    const other = toHttpFailure(503, undefined, new Headers({ 'retry-after': '5' }));

    expect(malformed).not.toHaveProperty('retryAfterS');
    expect(other).not.toHaveProperty('retryAfterS');
  });
});

describe('unwrapOr', () => {
  it('returns data on success and the fallback on failure', () => {
    expect(unwrapOr(ok(1), 0)).toBe(1);
    expect(unwrapOr(fail<number>({ kind: 'network', message: 'x' }), 0)).toBe(0);
  });
});
