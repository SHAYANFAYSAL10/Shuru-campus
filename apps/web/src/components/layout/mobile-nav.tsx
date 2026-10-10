'use client';

import { Menu } from 'lucide-react';
import * as m from 'motion/react-m';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type MouseEvent, type ReactNode } from 'react';

import { type OpeningHours } from '@campus/contracts';

import { BeginLine } from '@/components/motion/begin-line';
import { IconButton } from '@/components/ui/icon-button';
import { OpenStatus } from '@/components/ui/open-status';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/cn';
import { MEDIA, useMediaQuery, useReducedMotion } from '@/lib/hooks/use-media-query';
import { navCurrent, type NavItem } from '@/lib/navigation';
import { distance, ease, seconds, staggerDelay } from '@/styles/motion';

export interface MobileNavProps {
  items: readonly NavItem[];
  hours: OpeningHours;
  memberLoginUrl: string;
  /**
   * The header's own logo and call to action, repeated in the menu's top bar so opening the menu
   * changes nothing but the menu button.
   */
  bar: ReactNode;
  className?: string;
}

/**
 * The navigation below `lg` (docs/04-design-system.md §7): a full-screen sheet with the nav
 * links (staggered in), opening hours, the theme switch and member login. Focus is trapped, Esc
 * closes it and page scroll is locked where it was. It closes when a link is followed, on any
 * route change (back/forward included) and when the window widens to the desktop nav.
 */
export function MobileNav({ items, hours, memberLoginUrl, bar, className }: MobileNavProps) {
  const pathname = usePathname();
  const wide = useMediaQuery(MEDIA.wideNav);
  const reduced = useReducedMotion();
  // The page the menu was opened on, or null while closed.
  const [openOn, setOpenOn] = useState<string | null>(null);

  // Close for good (state reset during render, no effect) on a route change, back/forward
  // included, and when the desktop nav takes over (e.g. a tablet rotated). Coming back to the
  // page, or narrowing the window again, never reopens it.
  if (openOn !== null && (wide || openOn !== pathname)) setOpenOn(null);
  const open = openOn !== null && openOn === pathname && !wide;

  // Following any link closes the menu, even one to the current page (which changes no route).
  // Modified clicks open a new tab, so the menu stays.
  const closeOnLink = (event: MouseEvent<HTMLDivElement>) => {
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (!modified && event.target instanceof Element && event.target.closest('a[href]')) {
      setOpenOn(null);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpenOn(next ? pathname : null);
      }}
    >
      <SheetTrigger asChild>
        <IconButton label="Menu" icon={Menu} tooltip={false} className={className} />
      </SheetTrigger>
      <SheetContent
        title="Menu"
        hideTitle
        side="full"
        closeLabel="Close menu"
        headerStart={bar}
        onClick={closeOnLink}
      >
        <nav aria-label="Main" className="mx-auto w-full max-w-content pt-6 pb-10">
          <ul className="flex flex-col">
            {items.map((item, index) => {
              const current = navCurrent(pathname, item.href);
              return (
                <m.li
                  key={item.href}
                  // Mounted on open only (never in the SSR HTML), so starting hidden is safe.
                  initial={{ opacity: 0, y: reduced ? 0 : distance.reveal }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: seconds(reduced ? 'crossfade' : 'slow'),
                    ease: ease.out,
                    delay: reduced ? 0 : staggerDelay(index + 1) / 1000,
                  }}
                >
                  <NextLink
                    href={item.href}
                    aria-current={current}
                    className={cn(
                      'inline-flex min-h-hit flex-col justify-center rounded-sm py-2 type-h2 transition-colors',
                      current ? 'text-fg' : 'text-fg-muted hover:text-fg',
                    )}
                  >
                    {item.label}
                    {current ? <BeginLine className="mt-1" /> : null}
                  </NextLink>
                </m.li>
              );
            })}
          </ul>
        </nav>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: seconds(reduced ? 'crossfade' : 'slow'),
            ease: ease.out,
            delay: reduced ? 0 : staggerDelay(items.length + 1) / 1000,
          }}
          className="mx-auto mt-auto flex w-full max-w-content flex-col gap-6 border-t border-border pt-6"
        >
          <OpenStatus hours={hours} />
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <ThemeToggle iconOnly={false} />
            <NextLink
              href={memberLoginUrl}
              className="inline-flex min-h-hit items-center rounded-sm font-medium text-fg-muted transition-colors hover:text-fg"
            >
              Member login
            </NextLink>
          </div>
        </m.div>
      </SheetContent>
    </Sheet>
  );
}
