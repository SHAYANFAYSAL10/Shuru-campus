import { amenitiesSeed, defaultBrand, gallerySeed, siteSeed } from '@campus/contracts';

import { SeedError } from '#src/common/seed.js';

import {
  InMemoryAmenitiesRepository,
  InMemoryGalleryRepository,
  InMemorySiteRepository,
} from './in-memory-site.repository.js';

const acme = { ...defaultBrand, name: 'Acme Works', shortName: 'Acme' };

describe('InMemorySiteRepository', () => {
  it('serves the seed with the boot brand', async () => {
    const site = await new InMemorySiteRepository(acme).get();
    expect(site).toEqual({ ...siteSeed, brand: acme });
  });

  it('fails at construction on an invalid seed', () => {
    expect(
      () =>
        new InMemorySiteRepository(defaultBrand, {
          ...siteSeed,
          contact: { ...siteSeed.contact, phones: [] },
        }),
    ).toThrow(SeedError);
  });

  it('hands out copies, so mutations never leak into later reads', async () => {
    const repo = new InMemorySiteRepository(defaultBrand);
    const first = await repo.get();
    first.features.maintenanceMode = true;
    first.brand.name = 'Changed';
    const second = await repo.get();
    expect(second.features.maintenanceMode).toBe(siteSeed.features.maintenanceMode);
    expect(second.brand.name).toBe(defaultBrand.name);
  });
});

describe('InMemoryAmenitiesRepository', () => {
  it('serves every amenity in seed order', async () => {
    expect(await new InMemoryAmenitiesRepository().findAll()).toEqual(amenitiesSeed);
  });

  it('rejects duplicate IDs', () => {
    const [first] = amenitiesSeed;
    expect(() => new InMemoryAmenitiesRepository([first, first])).toThrow(/must be unique/);
  });
});

describe('InMemoryGalleryRepository', () => {
  const repo = new InMemoryGalleryRepository();

  it('serves every image without a filter', async () => {
    expect(await repo.findAll()).toEqual(gallerySeed);
  });

  it('filters by category, keeping seed order', async () => {
    const meeting = await repo.findAll({ category: 'meeting' });
    expect(meeting).toEqual(gallerySeed.filter((i) => i.category === 'meeting'));
    expect(meeting.length).toBeGreaterThan(0);
  });

  it('rejects an image without alt text', () => {
    const [first] = gallerySeed;
    expect(() => new InMemoryGalleryRepository([{ ...first, alt: '' }])).toThrow(SeedError);
  });
});
