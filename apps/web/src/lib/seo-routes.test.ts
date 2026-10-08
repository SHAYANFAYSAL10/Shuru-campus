import { describe, expect, it } from 'vitest';

import { publicPaths, robotsRules } from '@/lib/seo-routes';

describe('publicPaths', () => {
  it('lists every public page, plan pages after Spaces', () => {
    expect(publicPaths({ gallery: true }, ['hot-desk', 'private-office'])).toEqual([
      '/',
      '/spaces',
      '/spaces/hot-desk',
      '/spaces/private-office',
      '/about',
      '/gallery',
      '/contact',
      '/legal/privacy',
      '/legal/terms',
      '/legal/refund',
    ]);
  });

  it('leaves out the gallery when it is switched off', () => {
    expect(publicPaths({ gallery: false }, [])).not.toContain('/gallery');
  });

  it('never lists the admin console or the styleguide', () => {
    const paths = publicPaths({ gallery: true }, ['hot-desk']);
    expect(paths.some((path) => path.startsWith('/admin') || path.includes('styleguide'))).toBe(
      false,
    );
  });
});

describe('robotsRules', () => {
  const robots = robotsRules(new URL('https://example.com'));

  it('points crawlers at the sitemap', () => {
    expect(robots.sitemap).toBe('https://example.com/sitemap.xml');
  });

  it('keeps crawlers out of admin, the API and the styleguide', () => {
    expect(robots.rules).toEqual([
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/_styleguide'] },
    ]);
  });
});
