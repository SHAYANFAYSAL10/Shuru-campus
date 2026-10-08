'use client';

import { X } from 'lucide-react';
import { useRef } from 'react';

import { IconButton } from '@/components/ui/icon-button';
import {
  ANNOUNCEMENT_DISMISSED_ATTR,
  ANNOUNCEMENT_STORAGE_KEY,
  rememberDismissed,
} from '@/lib/announcement';
import { MAIN_CONTENT_ID } from '@/lib/navigation';
import { duration } from '@/styles/motion';

export interface AnnouncementDismissProps {
  /** `announcementId()` of the message this button dismisses. */
  id: string;
}

/**
 * Closes the announcement bar and remembers it for this message. The bar fades out (opacity only,
 * also under reduced motion), then CSS removes it via the list on <html>; focus moves on to the
 * page's content so it isn't lost with the button.
 */
export function AnnouncementDismiss({ id }: AnnouncementDismissProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const dismiss = () => {
    const bar = ref.current?.closest<HTMLElement>('[data-announcement]');
    bar?.setAttribute('data-leaving', '');

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
    } catch {
      // Storage blocked (private mode): the bar still closes, it just comes back next visit.
    }
    const next = rememberDismissed(
      stored ?? document.documentElement.getAttribute(ANNOUNCEMENT_DISMISSED_ATTR),
      id,
    );
    try {
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, next);
    } catch {
      // As above.
    }

    window.setTimeout(() => {
      document.documentElement.setAttribute(ANNOUNCEMENT_DISMISSED_ATTR, next);
      document.getElementById(MAIN_CONTENT_ID)?.focus({ preventScroll: true });
    }, duration.fast);
  };

  return (
    <IconButton
      ref={ref}
      label="Dismiss announcement"
      icon={X}
      size="sm"
      tooltip={false}
      data-announcement-dismiss=""
      onClick={dismiss}
    />
  );
}
