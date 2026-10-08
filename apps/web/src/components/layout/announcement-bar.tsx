import { ArrowRight, ArrowUpRight, Megaphone } from 'lucide-react';
import NextLink from 'next/link';

import { type Announcement } from '@campus/contracts';

import { AnnouncementDismiss } from '@/components/layout/announcement-dismiss';
import {
  ANNOUNCEMENT_DISMISSED_ATTR,
  announcementId,
  visibleAnnouncement,
} from '@/lib/announcement';

export interface AnnouncementBarProps {
  announcement: Announcement;
}

/**
 * The site-wide announcement (`site.announcement`, set in /admin/features): a slim info strip
 * right under the header, in the page flow, so it scrolls away with the page and never sits on
 * top of content. Dismissal is remembered per message: the boot script in the root layout puts
 * the dismissed ids on <html> before paint, and the rule below hides this bar when its id is
 * among them, so a dismissed bar never flashes. Without JS it shows, without the close button.
 */
export function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  const visible = visibleAnnouncement(announcement);
  if (!visible) return null;

  const id = announcementId(visible);
  const { text, href } = visible;
  const external = href?.startsWith('https://') ?? false;
  const Arrow = external ? ArrowUpRight : ArrowRight;

  return (
    <section
      aria-label="Announcement"
      data-announcement={id}
      className="border-b border-border bg-info-subtle text-fg transition-opacity duration-fast ease-in data-leaving:opacity-0"
    >
      {/* `id` is base-36 only (announcementId), so it is safe inside the selector. */}
      <style>{`:root[${ANNOUNCEMENT_DISMISSED_ATTR}~="${id}"] [data-announcement="${id}"]{display:none}`}</style>
      <div className="mx-auto flex max-w-content items-center gap-3 py-1 px-page-safe">
        <Megaphone aria-hidden="true" className="size-4 shrink-0 text-brand" strokeWidth={1.5} />
        <p className="min-w-0 flex-1 py-2 text-small [overflow-wrap:anywhere]">
          {href ? (
            <NextLink
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="group rounded-sm font-medium underline decoration-1 underline-offset-3 hover:decoration-2"
            >
              {text}
              {/* em-based so the arrow follows the text size and sits on its baseline. */}
              <Arrow
                aria-hidden="true"
                className="ml-1 inline size-[1em] align-[-0.125em] transition-transform duration-fast ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
                strokeWidth={1.5}
              />
              {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
            </NextLink>
          ) : (
            text
          )}
        </p>
        <AnnouncementDismiss id={id} />
      </div>
    </section>
  );
}
