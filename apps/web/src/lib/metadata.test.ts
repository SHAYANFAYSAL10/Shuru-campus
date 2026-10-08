import { describe, expect, it } from 'vitest';

import { defaultBrand, type Brand } from '@campus/contracts';

import { pageMetadata, siteDescription, siteMetadata } from '@/lib/metadata';

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

describe('pageMetadata', () => {
  it('titles a page through the template and shares it under the brand', () => {
    const metadata = pageMetadata(acme, {
      title: 'Spaces',
      description: 'Desks and rooms.',
      path: '/spaces',
    });

    expect(metadata.title).toBe('Spaces');
    expect(metadata.description).toBe('Desks and rooms.');
    expect(metadata.alternates?.canonical).toBe('/spaces');
    expect(metadata.openGraph).toMatchObject({
      siteName: 'Acme Works',
      type: 'website',
      title: 'Spaces · Acme Works',
      description: 'Desks and rooms.',
      url: '/spaces',
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Spaces · Acme Works',
      description: 'Desks and rooms.',
    });
  });

  it('keeps the site title on Home', () => {
    const metadata = pageMetadata(acme, { description: 'Welcome.', path: '/' });

    expect(metadata).not.toHaveProperty('title');
    expect(metadata.openGraph).toMatchObject({ title: 'Acme Works · Desks for doers', url: '/' });
  });
});
