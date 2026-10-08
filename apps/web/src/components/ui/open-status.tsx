'use client';

import { type OpeningHours } from '@campus/contracts';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { useNowMinute } from '@/lib/hooks/use-now';
import { openStatusText } from '@/lib/open-status';

export interface OpenStatusProps {
  hours: OpeningHours;
  className?: string;
}

/**
 * Live open/closed status in Dhaka time, updated every minute (A6 → OpenStatus). The dot always
 * comes with words. Rendered after hydration, so server and client clocks can't disagree; a
 * skeleton holds its place until then.
 */
export function OpenStatus({ hours, className }: OpenStatusProps) {
  const now = useNowMinute();

  if (!now) {
    return (
      <span className={cn('inline-flex items-center gap-2 text-small', className)}>
        <Skeleton className="size-2 rounded-full" />
        <Skeleton className="h-4 w-36" />
        <span className="sr-only">Checking opening hours</span>
      </span>
    );
  }

  const status = openStatusText(hours, now);
  return (
    <span className={cn('inline-flex items-center gap-2 text-small', className)}>
      <span aria-hidden="true" className="relative inline-flex size-2">
        {status.open ? (
          <span className="absolute inset-0 animate-pulse-dot rounded-full bg-success motion-reduce:hidden" />
        ) : null}
        <span
          className={cn(
            'relative size-2 rounded-full',
            status.open ? 'bg-success' : 'bg-fg-subtle',
          )}
        />
      </span>
      <span className="text-fg">
        {status.label}
        {status.detail ? <span className="text-fg-muted"> · {status.detail}</span> : null}
      </span>
    </span>
  );
}
