import { z } from 'zod';

import { ApiException } from './api-exception.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

const Body = z.object({ name: z.string().min(2), tags: z.array(z.string().min(1)) });

function failure(fn: () => unknown): ApiException {
  try {
    fn();
  } catch (error) {
    if (error instanceof ApiException) return error;
    throw error;
  }
  throw new Error('expected an ApiException');
}

describe('ZodValidationPipe', () => {
  it('returns the parsed output', () => {
    const pipe = new ZodValidationPipe(z.object({ n: z.coerce.number() }));
    expect(pipe.transform({ n: '3', extra: true })).toEqual({ n: 3 });
  });

  it('turns issues into a 400 with one detail per field (dot paths)', () => {
    const error = failure(() => new ZodValidationPipe(Body).transform({ name: 'A', tags: [''] }));
    expect(error.getStatus()).toBe(400);
    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.message).toBe('Some fields are invalid.');
    expect(error.details?.map((d) => d.path)).toEqual(['name', 'tags.0']);
  });

  it('accepts a custom message', () => {
    const error = failure(() => new ZodValidationPipe(Body, 'Check the plan.').transform({}));
    expect(error.message).toBe('Check the plan.');
  });

  it('explains a missing body', () => {
    const error = failure(() => new ZodValidationPipe(Body).transform(undefined));
    expect(error.details?.[0]?.message).toContain('JSON body');
  });
});
