import { type ComponentProps } from 'react';

import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'accent' | 'info';

// Each pairing is in the A4 contrast matrix: fg-muted/bg-alt, accent-text/accent-subtle,
// fg/info-subtle.
const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-bg-alt text-fg-muted',
  accent: 'bg-accent-subtle text-accent-text',
  info: 'bg-info-subtle text-fg',
};

export interface BadgeProps extends ComponentProps<'span'> {
  /** `accent` is the "Popular" plan marker; it counts as the viewport's marigold moment. */
  tone?: BadgeTone;
}

/** A short, static label. Not interactive; for toggles use `Chip`. */
export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-small font-medium',
        TONE[tone],
        className,
      )}
      {...rest}
    />
  );
}
