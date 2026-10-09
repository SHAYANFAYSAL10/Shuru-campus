import { Link } from '@/components/ui/link';
import { cn } from '@/lib/cn';
import { BOOK_VISIT_HREF } from '@/lib/navigation';

export interface PlansNoticeProps {
  /** `error`: plans couldn't be loaded. `empty`: there are none to show. */
  reason: 'error' | 'empty';
  className?: string;
}

/**
 * In place of plans that can't be shown (B6): what happened, and a person to ask instead of
 * stale or guessed prices. Used by Home → Spaces and the Spaces page.
 */
export function PlansNotice({ reason, className }: PlansNoticeProps) {
  return (
    <div className={cn('max-w-xl rounded-md border border-border bg-surface p-6', className)}>
      <p className="text-fg">
        {reason === 'empty'
          ? 'Our plans are being updated right now.'
          : 'Plans and prices aren’t loading right now.'}
      </p>
      <p className="mt-2 text-fg-muted">
        Refresh the page in a moment, or get in touch and we’ll share them with you.
      </p>
      <Link href={BOOK_VISIT_HREF} variant="standalone" className="mt-4 min-h-hit">
        Get in touch
      </Link>
    </div>
  );
}
