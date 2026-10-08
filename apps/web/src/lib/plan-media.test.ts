import { describe, expect, it } from 'vitest';

import { plansSeed } from '@campus/contracts';

import { planPhoto } from '@/lib/plan-media';

describe('planPhoto', () => {
  it.each(plansSeed.map((p) => [p.name, p]))('has a 4:5 photo for %s', (name, plan) => {
    const photo = planPhoto(plan);
    expect(photo?.src).toBe(`/placeholder/${plan.imageId}.jpg`);
    expect(photo && photo.width / photo.height).toBe(4 / 5);
    expect(photo?.alt).toContain(name);
  });

  it('has none for an image it does not know', () => {
    expect(planPhoto({ imageId: 'plan-new', name: 'New' })).toBeUndefined();
  });
});
