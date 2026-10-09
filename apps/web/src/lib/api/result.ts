import { ApiError, ERROR_STATUS, type ErrorCode, type ErrorDetail } from '@campus/contracts';

/**
 * Why a call failed. Callers branch on `kind`, never on thrown exceptions:
 * - `http`: the API answered with a non-2xx (shaped like `ApiError`, or synthesized from the status).
 * - `timeout`: no answer within the client's deadline.
 * - `network`: the request never completed (API down, DNS, connection reset).
 * - `invalid-response`: a 2xx whose body doesn't match the contract (version skew or a bug).
 */
export type ApiFailure =
  | {
      kind: 'http';
      status: number;
      code: ErrorCode;
      message: string;
      details: ErrorDetail[];
      requestId?: string;
      /** Seconds, from `Retry-After` on 429. */
      retryAfterS?: number;
    }
  | { kind: 'timeout'; timeoutMs: number }
  | { kind: 'network'; message: string }
  | { kind: 'invalid-response'; status: number; details: ErrorDetail[] };

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiFailure };

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: ApiFailure): ApiResult<T> {
  return { ok: false, error };
}

/** The data, or `fallback` when the call failed. */
export function unwrapOr<T>(result: ApiResult<T>, fallback: T): T {
  return result.ok ? result.data : fallback;
}

/** Closest documented code for a status when the body isn't an `ApiError` (e.g. a proxy page). */
export function codeForStatus(status: number): ErrorCode {
  const match = (Object.entries(ERROR_STATUS) as [ErrorCode, number][]).find(
    ([, s]) => s === status,
  );
  if (match) return match[0];
  return status >= 400 && status < 500 ? 'VALIDATION_FAILED' : 'INTERNAL';
}

function parseRetryAfter(header: string | null): number | undefined {
  if (header === null) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  const date = Date.parse(header);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

/** Maps a non-2xx response (already read as `body`) to an `http` failure. */
export function toHttpFailure(
  status: number,
  body: unknown,
  headers: Headers,
): Extract<ApiFailure, { kind: 'http' }> {
  const parsed = ApiError.safeParse(body);
  const requestId = parsed.success
    ? parsed.data.error.requestId
    : (headers.get('x-request-id') ?? undefined);
  const retryAfterS = status === 429 ? parseRetryAfter(headers.get('retry-after')) : undefined;
  return {
    kind: 'http',
    status,
    code: parsed.success ? parsed.data.error.code : codeForStatus(status),
    message: parsed.success ? parsed.data.error.message : 'Something went wrong. Please try again.',
    details: parsed.success ? (parsed.data.error.details ?? []) : [],
    ...(requestId === undefined ? {} : { requestId }),
    ...(retryAfterS === undefined ? {} : { retryAfterS }),
  };
}
