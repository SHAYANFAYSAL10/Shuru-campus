import { describe, expect, it } from 'vitest';

import { amenitiesSeed } from '@campus/contracts';

import { amenityIcon, FALLBACK_AMENITY_ICON } from '@/lib/amenity-icons';

describe('amenityIcon', () => {
  it.each(amenitiesSeed.map((a) => [a.icon]))('knows the seed icon "%s"', (icon) => {
    expect(amenityIcon(icon)).not.toBe(FALLBACK_AMENITY_ICON);
  });

  it('falls back for a name it does not know', () => {
    expect(amenityIcon('not-an-icon')).toBe(FALLBACK_AMENITY_ICON);
  });
});
