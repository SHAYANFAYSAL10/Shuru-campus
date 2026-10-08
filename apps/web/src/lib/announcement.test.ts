import { describe, expect, it, vi } from 'vitest';

import {
  ANNOUNCEMENT_BOOT_SCRIPT,
  ANNOUNCEMENT_DISMISSED_ATTR,
  ANNOUNCEMENT_STORAGE_KEY,
  announcementId,
  MAX_REMEMBERED_ANNOUNCEMENTS,
  rememberDismissed,
  visibleAnnouncement,
} from '@/lib/announcement';

describe('visibleAnnouncement', () => {
  it('shows an enabled announcement with text', () => {
    const announcement = { enabled: true, text: 'Open on Friday this week' };
    expect(visibleAnnouncement(announcement)).toBe(announcement);
  });

  it('hides a disabled or empty announcement', () => {
    expect(visibleAnnouncement({ enabled: false, text: 'Hidden' })).toBeNull();
    expect(visibleAnnouncement({ enabled: true, text: '   ' })).toBeNull();
  });
});

describe('announcementId', () => {
  it('is stable for the same message, and safe in a CSS attribute selector', () => {
    const id = announcementId({ text: 'Open on Friday', href: '/contact' });
    expect(announcementId({ text: 'Open on Friday', href: '/contact' })).toBe(id);
    expect(id).toMatch(/^a[0-9a-z]+$/);
  });

  it('changes when the text or the link changes', () => {
    const id = announcementId({ text: 'Open on Friday' });
    expect(announcementId({ text: 'Open on Saturday' })).not.toBe(id);
    expect(announcementId({ text: 'Open on Friday', href: '/contact' })).not.toBe(id);
  });
});

describe('rememberDismissed', () => {
  it('starts a list and appends to it', () => {
    expect(rememberDismissed(null, 'a1')).toBe('a1');
    expect(rememberDismissed('a1', 'a2')).toBe('a1 a2');
  });

  it('moves a repeated id to the end instead of duplicating it', () => {
    expect(rememberDismissed('a1 a2', 'a1')).toBe('a2 a1');
  });

  it('keeps only the most recent ids', () => {
    const many = Array.from({ length: MAX_REMEMBERED_ANNOUNCEMENTS }, (_, i) => `a${i}`).join(' ');
    const next = rememberDismissed(many, 'new').split(' ');
    expect(next).toHaveLength(MAX_REMEMBERED_ANNOUNCEMENTS);
    expect(next[0]).toBe('a1');
    expect(next.at(-1)).toBe('new');
  });
});

/** Runs the exact string shipped in <head>, as the browser would. */
function runBootScript(): void {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- testing an inline script
  const script = new Function(ANNOUNCEMENT_BOOT_SCRIPT) as () => void;
  script();
}

describe('ANNOUNCEMENT_BOOT_SCRIPT', () => {
  it('copies the stored list onto <html>', () => {
    localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, 'a1 a2');
    runBootScript();
    expect(document.documentElement.getAttribute(ANNOUNCEMENT_DISMISSED_ATTR)).toBe('a1 a2');
    document.documentElement.removeAttribute(ANNOUNCEMENT_DISMISSED_ATTR);
    localStorage.clear();
  });

  it('never throws when storage is unavailable', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(runBootScript).not.toThrow();
    getItem.mockRestore();
  });
});
