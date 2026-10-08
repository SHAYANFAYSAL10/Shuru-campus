'use client';

import { useProgressiveReveal } from '@/components/motion/use-progressive-reveal';
import { cn } from '@/lib/cn';

export interface BeginLineProps {
  /**
   * - `none`: always drawn.
   * - `mount`: draws on first paint, from CSS alone (no JS needed).
   * - `inView`: draws the first time it scrolls into view.
   */
  draw?: 'none' | 'mount' | 'inView';
  /** Delay before drawing, in ms (e.g. to follow a headline). */
  delay?: number;
  className?: string;
}

/**
 * The brand's signature stroke (04 §1): 1.5px in the accent color, drawn left to right.
 * Decorative, so hidden from assistive tech. Reduced motion: shown fully drawn.
 *
 * The SVG stretches horizontally only (viewBox height = rendered height), so the stroke keeps
 * its 1.5px thickness at any width without `vector-effect`.
 */
export function BeginLine({ draw = 'none', delay = 0, className }: BeginLineProps) {
  const { ref, state } = useProgressiveReveal<SVGSVGElement>(draw === 'inView');

  const pathClass =
    draw === 'mount'
      ? 'animate-draw motion-reduce:animate-none'
      : cn(state === 'hidden' && 'begin-line-undrawn', state === 'shown' && 'animate-draw');
  const animated = draw === 'mount' || state === 'shown';

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 4"
      preserveAspectRatio="none"
      data-draw={draw === 'inView' ? state : draw}
      className={cn('block h-1 w-full overflow-visible text-accent', className)}
    >
      <path
        d="M0 2 H100"
        pathLength={1}
        strokeDasharray={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className={pathClass}
        style={animated && delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
      />
    </svg>
  );
}
