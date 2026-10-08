// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { buildCsp, createNonce, securityHeaders } from '@/lib/security/csp';

function directives(csp: string): Map<string, string[]> {
  return new Map(
    csp.split('; ').map((part) => {
      const [name = '', ...values] = part.split(' ');
      return [name, values];
    }),
  );
}

describe('createNonce', () => {
  it('is 128 bits of base64 and different every time', () => {
    const nonce = createNonce();
    expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    expect(createNonce()).not.toBe(nonce);
  });
});

describe('buildCsp', () => {
  const production = directives(buildCsp({ nonce: 'abc', dev: false, https: true }));

  it('only runs scripts carrying the nonce', () => {
    expect(production.get('script-src')).toEqual(["'self'", "'nonce-abc'", "'strict-dynamic'"]);
    expect(production.get('script-src')).not.toContain("'unsafe-inline'");
  });

  it('locks down everything that is not same-origin', () => {
    expect(production.get('default-src')).toEqual(["'self'"]);
    expect(production.get('connect-src')).toEqual(["'self'"]);
    expect(production.get('object-src')).toEqual(["'none'"]);
    expect(production.get('frame-ancestors')).toEqual(["'none'"]);
    expect(production.get('base-uri')).toEqual(["'self'"]);
    expect(production.get('form-action')).toEqual(["'self'"]);
  });

  it('allows inline styles without listing a nonce (which would disable them)', () => {
    expect(production.get('style-src')).toEqual(["'self'", "'unsafe-inline'"]);
  });

  it('allows eval only in development', () => {
    expect(production.get('script-src')).not.toContain("'unsafe-eval'");
    const dev = directives(buildCsp({ nonce: 'abc', dev: true, https: false }));
    expect(dev.get('script-src')).toContain("'unsafe-eval'");
  });

  it('upgrades insecure requests only on an https site', () => {
    expect(production.has('upgrade-insecure-requests')).toBe(true);
    const http = directives(buildCsp({ nonce: 'abc', dev: false, https: false }));
    expect(http.has('upgrade-insecure-requests')).toBe(false);
  });
});

describe('securityHeaders', () => {
  const keys = (https: boolean) => securityHeaders({ https }).map(({ key }) => key);

  it('sets the baseline headers', () => {
    expect(keys(false)).toEqual(
      expect.arrayContaining([
        'X-Content-Type-Options',
        'Referrer-Policy',
        'Permissions-Policy',
        'X-Frame-Options',
        'Cross-Origin-Opener-Policy',
      ]),
    );
  });

  it('sends HSTS only over https', () => {
    expect(keys(true)).toContain('Strict-Transport-Security');
    expect(keys(false)).not.toContain('Strict-Transport-Security');
  });
});
