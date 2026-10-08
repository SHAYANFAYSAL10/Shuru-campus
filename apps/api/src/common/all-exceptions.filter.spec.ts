import {
  type ArgumentsHost,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';

import { ApiError } from '@campus/contracts';

import { loadConfig } from '#src/config/app-config.js';
import { testEnv } from '#test/fixtures/env.js';

import { AllExceptionsFilter } from './all-exceptions.filter.js';
import { ApiException } from './api-exception.js';

function run(exception: unknown, nodeEnv: 'test' | 'production' = 'test') {
  const filter = new AllExceptionsFilter(loadConfig(testEnv({ NODE_ENV: nodeEnv })));
  const headers: Record<string, string> = {};
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    setHeader: (name: string, value: string) => (headers[name] = value),
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
    },
  };
  const host = {
    switchToHttp: () => ({ getRequest: () => ({ id: 'req-1234' }), getResponse: () => res }),
  } as unknown as ArgumentsHost;
  filter.catch(exception, host);
  return { status: res.statusCode, body: ApiError.parse(res.body), headers };
}

describe('AllExceptionsFilter', () => {
  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('renders a validation error with details', () => {
    const { status, body, headers } = run(
      new ApiException('VALIDATION_FAILED', 'Some fields are invalid.', [
        { path: 'email', message: 'Enter a valid email address.' },
      ]),
    );
    expect(status).toBe(400);
    expect(body.error).toEqual({
      code: 'VALIDATION_FAILED',
      message: 'Some fields are invalid.',
      details: [{ path: 'email', message: 'Enter a valid email address.' }],
      requestId: 'req-1234',
    });
    expect(headers['Cache-Control']).toBe('no-store');
  });

  it('passes through extra headers such as Retry-After', () => {
    const { status, headers } = run(
      new ApiException('RATE_LIMITED', 'Slow down.', undefined, { 'Retry-After': '42' }),
    );
    expect(status).toBe(429);
    expect(headers['Retry-After']).toBe('42');
  });

  it('maps Nest HTTP exceptions to contract codes with friendly messages', () => {
    expect(run(new NotFoundException('Cannot GET /x')).body.error).toEqual({
      code: 'NOT_FOUND',
      message: 'Nothing here.',
      requestId: 'req-1234',
    });
    expect(run(new ThrottlerException()).body.error.code).toBe('RATE_LIMITED');
  });

  it('maps other 4xx statuses to VALIDATION_FAILED and keeps the status', () => {
    const { status, body } = run(new PayloadTooLargeException());
    expect(status).toBe(413);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  it('hides internal errors in production: generic message, no stack', () => {
    const { status, body } = run(new Error('db password is hunter2'), 'production');
    expect(status).toBe(500);
    expect(body.error).toEqual({
      code: 'INTERNAL',
      message: 'Something went wrong on our side. Please try again.',
      requestId: 'req-1234',
    });
    expect(JSON.stringify(body)).not.toMatch(/hunter2|\.ts:\d+/);
  });

  it('shows the internal message (never the stack) outside production', () => {
    const { body } = run(new Error('boom'));
    expect(body.error.message).toBe('Internal error: boom');
    expect(JSON.stringify(body)).not.toMatch(/\.ts:\d+/);
  });

  it('copes with non-Error throwables', () => {
    expect(run('a string', 'production').status).toBe(500);
  });
});
