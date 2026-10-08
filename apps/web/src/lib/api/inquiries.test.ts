// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InquiryCreate } from '@campus/contracts';

import { INQUIRY_TIMEOUT_MS, postInquiry } from '@/lib/api/inquiries';

const inquiry = InquiryCreate.parse({
  name: 'Nadia Rahman',
  email: 'nadia@example.com',
  message: 'Looking for a desk next month.',
});

function respondWith(body: unknown, status: number) {
  const fn = vi.fn((_url: string, _init: RequestInit) =>
    Promise.resolve(new Response(JSON.stringify(body), { status })),
  );
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('postInquiry', () => {
  it('posts the inquiry uncached, from the site origin, for the visitor', async () => {
    const accepted = { id: 'inq_1', receivedAt: '2026-10-09T04:00:00.000Z' };
    const fetchMock = respondWith(accepted, 202);

    expect(await postInquiry(inquiry, { forwardedFor: '203.0.113.7' })).toEqual({
      ok: true,
      data: accepted,
    });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);
    expect(url).toBe('http://localhost:4000/api/v1/inquiries');
    expect(init?.method).toBe('POST');
    expect(init?.cache).toBe('no-store');
    expect(JSON.parse(init?.body as string)).toEqual(inquiry);
    expect(headers.get('x-forwarded-for')).toBe('203.0.113.7');
    expect(headers.get('origin')).toBe('http://localhost:3000');
    expect(INQUIRY_TIMEOUT_MS).toBeGreaterThan(3000);
  });

  it('sends no forwarding header it was not given', async () => {
    const fetchMock = respondWith({ id: 'inq_1', receivedAt: '2026-10-09T04:00:00.000Z' }, 202);
    await postInquiry(inquiry);
    expect(new Headers(fetchMock.mock.calls[0]?.[1].headers).has('x-forwarded-for')).toBe(false);
  });

  it('passes a rate limit through with its wait', async () => {
    const fn = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            error: { code: 'RATE_LIMITED', message: 'Too many requests', requestId: 'r1' },
          }),
          { status: 429, headers: { 'retry-after': '30' } },
        ),
      ),
    );
    vi.stubGlobal('fetch', fn);
    expect(await postInquiry(inquiry)).toMatchObject({
      ok: false,
      error: { kind: 'http', status: 429, retryAfterS: 30 },
    });
  });
});
