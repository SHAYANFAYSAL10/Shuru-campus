import { describe, expect, it } from 'vitest';

import { defaultBrand, type Brand } from '@campus/contracts';

import { siteDescription, siteMetadata } from '@/lib/metadata';

const acme: Brand = {
  ...defaultBrand,
  name: 'Acme Works',
  shortName: 'Acme',
  legalName: 'Acme Works Ltd.',
  tagline: 'Desks for doers',
  subTagline: 'Built for focus',
};

describe('siteMetadata', () => {
  const metadata = siteMetadata(acme, new URL('https://example.com'));

  it('titles pages with the brand', () => {
    expect(metadata.title).toEqual({
      default: 'Acme Works · Desks for doers',
      template: '%s · Acme Works',
    });
    expect(metadata.applicationName).toBe('Acme Works');
  });

  it('describes the site from the taglines', () => {
    expect(siteDescription(acme)).toBe('Desks for doers. Built for focus.');
    expect(metadata.description).toBe('Desks for doers. Built for focus.');
    expect(siteDescription({ tagline: 'Work, begun!', subTagline: 'Calm. ' })).toBe(
      'Work, begun! Calm.',
    );
  });

  it('resolves URLs against the site URL', () => {
    expect(metadata.metadataBase?.toString()).toBe('https://example.com/');
  });

  it('shares as the brand, with a large card', () => {
    expect(metadata.openGraph).toMatchObject({ siteName: 'Acme Works', type: 'website' });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('never mentions the default brand', () => {
    expect(JSON.stringify(metadata)).not.toContain(defaultBrand.shortName);
  });
});
