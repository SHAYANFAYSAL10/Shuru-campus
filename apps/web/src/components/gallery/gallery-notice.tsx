import { Link } from '@/components/ui/link';
import { cn } from '@/lib/cn';
import { BOOK_VISIT_HREF } from '@/lib/navigation';

export interface GalleryNoticeProps {
  /** `error`: the photos couldn't be loaded. `empty`: there are none yet. */
  reason: 'error' | 'empty';
  className?: string;
}

/**
 * In place of a gallery that can't be shown (B6): what happened, and the real thing instead,
 * a visit.
 */
export function GalleryNotice({ reason, className }: GalleryNoticeProps) {
  return (
    <div className={cn('max-w-xl rounded-md border border-border bg-surface p-6', className)}>
      <p className="text-fg">
        {reason === 'empty'
          ? 'We’re putting the photos together.'
          : 'The photos aren’t loading right now.'}
      </p>
      <p className="mt-2 text-fg-muted">
        {reason === 'empty'
          ? 'In the meantime, the best way to see the space is in person.'
          : 'Refresh the page in a moment, or come and see the space in person.'}
      </p>
      <Link href={BOOK_VISIT_HREF} variant="standalone" className="mt-4 min-h-hit">
        Book a visit
      </Link>
    </div>
  );
}
