'use client';

import * as m from 'motion/react-m';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { BeginLine } from '@/components/motion/begin-line';
import { cn } from '@/lib/cn';
import { navCurrent, type NavItem } from '@/lib/navigation';
import { ease, seconds } from '@/styles/motion';

/**
 * Shared `layoutId` of the begin line under the current nav item. The hero's begin line hands
 * off to it (04 §6, signature moment 2), and it glides between items on navigation.
 */
export const NAV_BEGIN_LINE_ID = 'nav-begin-line';

export interface PrimaryNavProps {
  items: readonly NavItem[];
  className?: string;
}

/**
 * Desktop navigation. The current page (or its section) is marked with `aria-current` and the
 * begin line, never color alone (A5 → Do 3). Reduced motion: the line moves without gliding.
 */
export function PrimaryNav({ items, className }: PrimaryNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const current = navCurrent(pathname, item.href);
          return (
            <li key={item.href}>
              <NextLink
                href={item.href}
                aria-current={current}
                className={cn(
                  'relative inline-flex min-h-hit items-center rounded-sm px-3 text-small font-medium whitespace-nowrap transition-colors',
                  current ? 'text-fg' : 'text-fg-muted hover:text-fg',
                )}
              >
                {item.label}
                {current ? (
                  <m.span
                    layoutId={NAV_BEGIN_LINE_ID}
                    transition={{ duration: seconds('base'), ease: ease.inOut }}
                    className="absolute inset-x-3 bottom-2"
                  >
                    <BeginLine />
                  </m.span>
                ) : null}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
