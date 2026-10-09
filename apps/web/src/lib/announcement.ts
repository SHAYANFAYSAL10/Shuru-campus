import { type Announcement } from '@campus/contracts';

/** localStorage key: the ids of dismissed announcements, space-separated, newest last. */
export const ANNOUNCEMENT_STORAGE_KEY = 'announcement-dismissed';
/** Attribute on <html> holding the same list, so CSS can hide a dismissed bar before paint. */
export const ANNOUNCEMENT_DISMISSED_ATTR = 'data-announcement-dismissed';
/** How many dismissed messages are remembered. Older ones show again if they ever come back. */
export const MAX_REMEMBERED_ANNOUNCEMENTS = 10;

/** The announcement to show, or `null` when the banner is off or has no text. */
export function visibleAnnouncement(announcement: Announcement): Announcement | null {
  return announcement.enabled && announcement.text.trim() ? announcement : null;
}

/**
 * A short id for one message (its text and link), so a dismissal is remembered per message:
 * editing the announcement shows it again. 32-bit FNV-1a, in base 36.
 */
export function announcementId({ text, href }: Pick<Announcement, 'text' | 'href'>): string {
  let hash = 0x811c9dc5;
  for (const char of `${text.trim()}\n${href ?? ''}`) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return `a${(hash >>> 0).toString(36)}`;
}

/** The stored list with `id` added (moved to the end if already there), capped. */
export function rememberDismissed(stored: string | null, id: string): string {
  const ids = (stored ?? '').split(/\s+/).filter((value) => value && value !== id);
  return [...ids, id].slice(-MAX_REMEMBERED_ANNOUNCEMENTS).join(' ');
}

/**
 * Blocking script for <head>: copies the stored list onto <html> before first paint, so a
 * dismissed bar never flashes. Holds no announcement data, so it is the same on every page.
 */
export const ANNOUNCEMENT_BOOT_SCRIPT = `try{var v=localStorage.getItem(${JSON.stringify(
  ANNOUNCEMENT_STORAGE_KEY,
)});if(v)document.documentElement.setAttribute(${JSON.stringify(
  ANNOUNCEMENT_DISMISSED_ATTR,
)},v)}catch(e){}`;
