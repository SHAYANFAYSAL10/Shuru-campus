// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { proxy } from '@/proxy';

/** NextResponse.next({ request }) forwards overridden request headers under this prefix. */
const forwarded = (response: Response, name: string) =>
  response.headers.get(`x-middleware-request-${name}`);

describe('proxy', () => {
  it('sets a CSP with a fresh nonce on the response and the request', () => {
    const response = proxy(new NextRequest('http://localhost:3000/'));
    const csp = response.headers.get('content-security-policy');
    const nonce = forwarded(response, 'x-nonce');

    expect(nonce).toBeTruthy();
    expect(csp).toContain(`'nonce-${nonce ?? ''}'`);
    expect(forwarded(response, 'content-security-policy')).toBe(csp);
  });

  it('uses a new nonce for every request', () => {
    const first = proxy(new NextRequest('http://localhost:3000/'));
    const second = proxy(new NextRequest('http://localhost:3000/'));
    expect(forwarded(first, 'x-nonce')).not.toBe(forwarded(second, 'x-nonce'));
  });
});
