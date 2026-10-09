import { describe, expect, it } from 'vitest';

import { telHref } from '@/lib/contact';

describe('telHref', () => {
  it('keeps the country code and drops the separators', () => {
    expect(telHref('+88 09666-731731')).toBe('tel:+8809666731731');
    expect(telHref('88 01700-766084')).toBe('tel:+8801700766084');
  });

  it('adds the country code to a national number', () => {
    expect(telHref('01700-766084')).toBe('tel:+8801700766084');
  });
});
