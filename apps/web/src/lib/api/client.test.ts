// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HealthResponse } from '@campus/contracts';

import { apiFetch } from '@/lib/api/client';

const health = { status: 'ok', version: '1.0.0', dataSource: 'memory', uptimeS: 12 };

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

function mockFetch(impl: (url: string, init: RequestInit) => Promise<Response>) {
  const fn = vi.fn(impl);
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiFetch', () => {
  it('returns parsed data for a 2xx that matches the schema', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(json(health)));

    const result = await apiFetch('/health', HealthResponse);

    expect(result).toEqual({ ok: true, data: health });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/v1/health',
      expect.anything(),
    );
  });

  it('uses the Next data cache with tags for cached GETs', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(json(health)));

    await apiFetch('/health', HealthResponse, { cache: { tags: ['site'], revalidate: 60 } });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.next).toEqual({ tags: ['site'], revalidate: 60 });
    expect(init?.cache).toBeUndefined();
  });

  it('turns a schema mismatch into a typed invalid-response error', async () => {
    mockFetch(() => Promise.resolve(json({ ...health, uptimeS: 'soon' })));

    const result = await apiFetch('/health', HealthResponse);

    expect(result).toMatchObject({
      ok: false,
      error: { kind: 'invalid-response', status: 200, details: [{ path: 'uptimeS' }] },
    });
  });

  it('treats an unparseable 2xx body as an invalid response', async () => {
    mockFetch(() => Promise.resolve(new Response('<html>', { status: 200 })));

    const result = await apiFetch('/health', HealthResponse);

    expect(result).toMatchObject({ ok: false, error: { kind: 'invalid-response' } });
  });

  it('times out with a typed error instead of hanging', async () => {
    mockFetch(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            reject(init.signal?.reason as Error);
          });
        }),
    );

    const result = await apiFetch('/health', HealthResponse, { timeoutMs: 20 });

    expect(result).toEqual({ ok: false, error: { kind: 'timeout', timeoutMs: 20 } });
  });

  it('maps a connection failure to a network error', async () => {
    mockFetch(() => Promise.reject(new TypeError('fetch failed')));

    const result = await apiFetch('/health', HealthResponse);

    expect(result).toEqual({ ok: false, error: { kind: 'network', message: 'fetch failed' } });
  });

  it('maps an API error body to an http error', async () => {
    mockFetch(() =>
      Promise.resolve(
        json(
          { error: { code: 'NOT_FOUND', message: 'Plan not found.', requestId: 'req-12345678' } },
          { status: 404 },
        ),
      ),
    );

    const result = await apiFetch('/plans/nope', HealthResponse);

    expect(result).toEqual({
      ok: false,
      error: {
        kind: 'http',
        status: 404,
        code: 'NOT_FOUND',
        message: 'Plan not found.',
        details: [],
        requestId: 'req-12345678',
      },
    });
  });

  it('sends Origin and JSON on mutations and never caches them', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(json(health, { status: 202 })));

    await apiFetch('/health', HealthResponse, {
      method: 'POST',
      body: { a: 1 },
      cache: { tags: ['site'], revalidate: 60 },
    });

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"a":1}');
    expect(init?.cache).toBe('no-store');
    expect(init?.next).toBeUndefined();
    expect(headers.get('origin')).toBe('http://localhost:3000');
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('does not send Origin on GETs', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(json(health)));

    await apiFetch('/health', HealthResponse);

    expect(new Headers(fetchMock.mock.calls[0]?.[1].headers).has('origin')).toBe(false);
  });
});
