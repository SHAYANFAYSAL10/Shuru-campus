import { cn } from '@/lib/cn';

export interface BrokenBeginLineProps {
  /** Delay before drawing, in ms (e.g. to follow a headline). */
  delay?: number;
  className?: string;
}

/**
 * The begin line that doesn't connect (404, docs/05-pages-and-interactions.md): it draws toward
 * an end point, nearly reaches it, and falls back short. Runs from CSS on first paint, so it
 * needs no JS. Reduced motion: shown at rest, the gap already open. Decorative.
 *
 * Same geometry as `BeginLine` (stretches horizontally, keeps its 1.5px stroke); the end point is
 * an HTML dot so it stays round at any width.
 */
export function BrokenBeginLine({ delay = 0, className }: BrokenBeginLineProps) {
  return (
    <div aria-hidden="true" className={cn('flex items-center', className)}>
      <svg
        focusable="false"
        viewBox="0 0 100 4"
        preserveAspectRatio="none"
        className="block h-1 min-w-0 flex-1 overflow-visible text-accent"
      >
        <path
          d="M0 2 H100"
          pathLength={1}
          strokeDasharray={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="animate-draw-short begin-line-short motion-reduce:animate-none"
          style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
        />
      </svg>
      {/* The end point it never reaches. 1.5px border to match the line's stroke. */}
      <span className="size-2.5 shrink-0 rounded-full border-[1.5px] border-border-strong" />
    </div>
  );
}
