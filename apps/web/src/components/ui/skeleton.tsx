import { type ComponentProps } from 'react';

import { cn } from '@/lib/cn';

/**
 * A placeholder block shaped like the content it stands in for (B6: no spinners for page
 * content). Size it with classes. Hidden from assistive tech: mark the loading region itself
 * with `aria-busy` and a visually hidden "Loading …" label.
 */
export function Skeleton({ className, ...rest }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-skeleton rounded-sm bg-bg-alt motion-reduce:animate-none', className)}
      {...rest}
    />
  );
}
