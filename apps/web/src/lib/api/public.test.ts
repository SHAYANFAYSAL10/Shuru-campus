// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { amenitiesSeed, defaultBrand, gallerySeed, plansSeed, siteSeed } from '@campus/contracts';

import { getBrand, getSiteSettings } from '@/lib/api/brand';
import { getAmenities, getGallery, getHealth, getPlan, getPlans, getSite } from '@/lib/api/public';

function respondWith(body: unknown, status = 200) {
  const fn = vi.fn((_url: string, _init: RequestInit) =>
    Promise.resolve(new Response(JSON.stringify(body), { status })),
  );
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('public fetchers', () => {
  it('getSite caches under the site tag', async () => {
    const fetchMock = respondWith(siteSeed);

    expect(await getSite()).toEqual({ ok: true, data: siteSeed });
    expect(fetchMock.mock.calls[0]?.[1].next).toEqual({ tags: ['site'], revalidate: 60 });
  });

  it('getPlans unwraps the collection', async () => {
    respondWith({ items: plansSeed });

    expect(await getPlans()).toEqual({ ok: true, data: plansSeed });
  });

  it('getPlans passes failures through', async () => {
    respondWith({ items: [{ slug: 'x' }] });

    expect(await getPlans()).toMatchObject({ ok: false, error: { kind: 'invalid-response' } });
  });

  it('getPlan tags the single plan too', async () => {
    const plan = plansSeed[0];
    if (!plan) throw new Error('The seed has no plans.');
    const fetchMock = respondWith(plan);

    await getPlan(plan.slug);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`http://localhost:4000/api/v1/plans/${plan.slug}`);
    expect(init?.next?.tags).toEqual(['plans', `plan:${plan.slug}`]);
  });

  it('getAmenities and getGallery unwrap their collections', async () => {
    respondWith({ items: amenitiesSeed });
    expect(await getAmenities()).toEqual({ ok: true, data: amenitiesSeed });

    const fetchMock = respondWith({ items: gallerySeed });
    expect(await getGallery('cafe')).toEqual({ ok: true, data: gallerySeed });
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:4000/api/v1/gallery?category=cafe');
  });

  it('getAmenities and getGallery pass failures through', async () => {
    respondWith({ error: { code: 'INTERNAL', message: 'x', requestId: 'r' } }, 500);

    expect(await getAmenities()).toMatchObject({ ok: false, error: { code: 'INTERNAL' } });
    expect(await getGallery()).toMatchObject({ ok: false, error: { code: 'INTERNAL' } });
  });

  it('getHealth is never cached', async () => {
    const fetchMock = respondWith({ status: 'ok', version: '1', dataSource: 'memory', uptimeS: 1 });

    await getHealth();

    expect(fetchMock.mock.calls[0]?.[1].cache).toBe('no-store');
  });
});

describe('getBrand', () => {
  it('returns the brand from the API', async () => {
    const brand = { ...defaultBrand, name: 'Test Hub', shortName: 'Hub' };
    respondWith({ ...siteSeed, brand });

    expect(await getBrand()).toEqual(brand);
  });

  it('falls back to the seed default when the API is down', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('fetch failed')));

    expect(await getBrand()).toEqual(defaultBrand);
  });
});

describe('getSiteSettings', () => {
  it('returns the settings from the API', async () => {
    const settings = { ...siteSeed, features: { ...siteSeed.features, gallery: false } };
    respondWith(settings);

    expect(await getSiteSettings()).toEqual(settings);
  });

  it('falls back to the seed when the API answers off-contract', async () => {
    respondWith({ brand: { name: '' } });

    expect(await getSiteSettings()).toEqual(siteSeed);
  });
});
