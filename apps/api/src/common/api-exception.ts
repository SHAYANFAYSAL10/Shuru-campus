import { HttpException } from '@nestjs/common';

import { ERROR_STATUS, type ErrorCode, type ErrorDetail } from '@campus/contracts';

/**
 * An error with a contract code (docs/06-api.md). The exception filter renders it as the
 * `ApiError` body; `message` is shown to people, so write it for them.
 */
export class ApiException extends HttpException {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: ErrorDetail[],
    /** Extra response headers, e.g. `Retry-After`. */
    readonly headers: Record<string, string> = {},
  ) {
    super(message, ERROR_STATUS[code]);
  }
}
