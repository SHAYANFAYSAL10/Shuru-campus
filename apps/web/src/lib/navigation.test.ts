import { describe, expect, it } from 'vitest';

import { navCurrent, primaryNav } from '@/lib/navigation';

describe('primaryNav', () => {
  it('lists the public pages in order', () => {
    expect(primaryNav({ gallery: true }).map((item) => item.href)).toEqual([
      '/spaces',
      '/about',
      '/gallery',
      '/contact',
    ]);
  });

  it('drops the gallery when its flag is off', () => {
    expect(primaryNav({ gallery: false }).map((item) => item.href)).not.toContain('/gallery');
  });
});

describe('navCurrent', () => {
  it('marks the page itself', () => {
    expect(navCurrent('/spaces', '/spaces')).toBe('page');
    expect(navCurrent('/spaces/', '/spaces')).toBe('page');
  });

  it('marks the section for pages below it', () => {
    expect(navCurrent('/spaces/hot-desk', '/spaces')).toBe('true');
  });

  it('ignores lookalike prefixes and other pages', () => {
    expect(navCurrent('/spacesuit', '/spaces')).toBeUndefined();
    expect(navCurrent('/about', '/spaces')).toBeUndefined();
  });

  it('treats home as a page, never a section', () => {
    expect(navCurrent('/', '/')).toBe('page');
    expect(navCurrent('/about', '/')).toBeUndefined();
  });
});
