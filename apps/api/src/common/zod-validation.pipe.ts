import { type PipeTransform } from '@nestjs/common';
import { type z } from 'zod';

import { toErrorDetails } from '@campus/contracts';

import { ApiException } from './api-exception.js';

/**
 * Validates a body, query or param against a contracts schema and returns the parsed
 * output. Failures become `400 VALIDATION_FAILED` with one detail per field.
 */
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform<unknown, z.output<T>> {
  constructor(
    private readonly schema: T,
    private readonly message = 'Some fields are invalid.',
  ) {}

  transform(value: unknown): z.output<T> {
    if (value === undefined) {
      throw new ApiException('VALIDATION_FAILED', this.message, [
        { path: '', message: 'Send a JSON body with Content-Type: application/json.' },
      ]);
    }
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new ApiException('VALIDATION_FAILED', this.message, toErrorDetails(result.error));
    }
    return result.data;
  }
}
