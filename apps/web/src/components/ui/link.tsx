import { ArrowRight, ArrowUpRight } from 'lucide-react';
import NextLink from 'next/link';
import { type ComponentProps } from 'react';

import { cn } from '@/lib/cn';

type NextLinkProps = ComponentProps<typeof NextLink>;

export interface LinkProps extends Omit<NextLinkProps, 'href'> {
  href: string;
  /**
   * - `inline`: inside running text. Accent-colored and underlined, so it reads as a link
   *   without relying on color; the underline thickens on hover. Safe across line breaks.
   * - `standalone`: a call to action on its own line ("See Hot Desk pricing"). An arrow, and
   *   the begin line draws underneath on hover and focus.
   */
  variant?: 'inline' | 'standalone';
  /** Opens in a new tab, with an icon and a screen-reader note saying so. */
  external?: boolean;
}

const VARIANT = {
  inline:
    'rounded-sm text-accent-text underline decoration-1 underline-offset-3 hover:decoration-2',
  standalone: 'group link-draw inline-flex items-center gap-1.5 font-medium text-fg',
} as const;

/** Site link with Next.js client navigation. `external` opens a new tab and says so. */
export function Link({
  href,
  variant = 'inline',
  external = false,
  className,
  children,
  ...rest
}: LinkProps) {
  const classes = cn(VARIANT[variant], className);
  const icon =
    variant === 'standalone' ? (
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform duration-fast ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
        strokeWidth={1.5}
      />
    ) : null;

  if (external) {
    return (
      <NextLink href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
        {children}{' '}
        {/* em-based so the icon follows the link's text size and sits on its baseline. */}
        <ArrowUpRight
          aria-hidden="true"
          className="inline size-[0.9em] shrink-0 align-[-0.1em]"
          strokeWidth={1.5}
        />
        <span className="sr-only">(opens in a new tab)</span>
      </NextLink>
    );
  }

  return (
    <NextLink href={href} className={classes} {...rest}>
      {children}
      {icon}
    </NextLink>
  );
}
