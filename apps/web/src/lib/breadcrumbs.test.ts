import { describe, expect, it } from 'vitest';

import { breadcrumbJsonLd } from '@/lib/breadcrumbs';

describe('breadcrumbJsonLd', () => {
  it('numbers the trail from 1 with absolute URLs', () => {
    const base = new URL('https://example.com');
    expect(
      breadcrumbJsonLd(
        [
          { name: 'Spaces & pricing', path: '/spaces' },
          { name: 'Hot Desk', path: '/spaces/hot-desk' },
        ],
        base,
      ),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Spaces & pricing',
          item: 'https://example.com/spaces',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Hot Desk',
          item: 'https://example.com/spaces/hot-desk',
        },
      ],
    });
  });
});
