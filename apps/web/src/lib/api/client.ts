import 'server-only';

import { toErrorDetails } from '@campus/contracts';

import { API_BASE, DEFAULT_TIMEOUT_MS, SITE_ORIGIN } from '@/lib/api/config';
import { fail, ok, toHttpFailure, type ApiResult } from '@/lib/api/result';

import type { z } from 'zod';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequest {
  method?: Method;
  /** Serialized as JSON. */
  body?: unknown;
  headers?: HeadersInit;
  timeoutMs?: number;
  /**
   * Caching for GETs. `{ tags, revalidate }` uses the Next data cache (public content);
   * `'no-store'` skips it (admin, auth, health). Mutations are never cached.
   */
  cache?: { tags: readonly string[]; revalidate: number } | 'no-store';
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.length === 0) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * The one way the web server talks to the API. Never throws: every outcome is an `ApiResult`,
 * and every 2xx body is validated against the contract `schema` before it reaches a component.
 */
export async function apiFetch<S extends z.ZodType>(
  path: `/${string}`,
  schema: S,
  {
    method = 'GET',
    body,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    cache = 'no-store',
  }: ApiRequest = {},
): Promise<ApiResult<z.output<S>>> {
  const isMutation = method !== 'GET';
  const requestHeaders = new Headers(headers);
  requestHeaders.set('accept', 'application/json');
  if (body !== undefined) requestHeaders.set('content-type', 'application/json');
  if (isMutation) requestHeaders.set('origin', SITE_ORIGIN);

  const init: RequestInit = {
    method,
    headers: requestHeaders,
    signal: AbortSignal.timeout(timeoutMs),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    ...(isMutation || cache === 'no-store'
      ? { cache: 'no-store' as const }
      : { next: { tags: [...cache.tags], revalidate: cache.revalidate } }),
  };

  let res: Response;
  let payload: unknown;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
    payload = await readJson(res);
  } catch (error) {
    if (isTimeout(error)) return fail({ kind: 'timeout', timeoutMs });
    return fail({
      kind: 'network',
      message: error instanceof Error ? error.message : 'Request failed',
    });
  }

  if (!res.ok) return fail(toHttpFailure(res.status, payload, res.headers));

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return fail({
      kind: 'invalid-response',
      status: res.status,
      details: toErrorDetails(parsed.error),
    });
  }
  return ok(parsed.data);
}
