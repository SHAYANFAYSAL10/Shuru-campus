import { createParamDecorator, type ExecutionContext, type PipeTransform } from '@nestjs/common';
import { type Request } from 'express';
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

const requestBody = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): unknown => ctx.switchToHttp().getRequest<Request>().body,
);
const requestQuery = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): unknown =>
    ctx.switchToHttp().getRequest<Request>().query,
);

// Custom decorators rather than `@Body()`/`@Query()` with the pipe: Swagger skips custom
// parameters, so docs come only from the Zod schemas (`ApiJsonBody`), never from the TS
// design type (which some compilers emit as the schema object itself).

/** The request body, validated against a contracts schema. */
export const ZodBody = (schema: z.ZodType, message?: string): ParameterDecorator =>
  requestBody(new ZodValidationPipe(schema, message));

/** The query string, validated against a contracts schema. */
export const ZodQuery = (schema: z.ZodType, message?: string): ParameterDecorator =>
  requestQuery(new ZodValidationPipe(schema, message));
