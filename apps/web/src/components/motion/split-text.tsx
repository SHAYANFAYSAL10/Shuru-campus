'use client';

import { Fragment } from 'react';

import { useProgressiveReveal } from '@/components/motion/use-progressive-reveal';
import { cn } from '@/lib/cn';
import { staggerDelay } from '@/styles/motion';

export interface SplitTextProps {
  text: string;
  /**
   * - `mount`: plays on first paint, from CSS alone (no JS needed). For above-the-fold headlines.
   * - `inView`: plays the first time it scrolls into view (progressive, see `Reveal`).
   */
  trigger?: 'mount' | 'inView';
  /** Stagger offset, in steps, so a SplitText can follow another element. */
  startIndex?: number;
  className?: string;
}

/**
 * Words slide up out of a mask, one after another. Screen readers get the sentence once, from
 * a visually hidden copy; the animated words are hidden from them. Reduced motion: no movement.
 */
export function SplitText({ text, trigger = 'inView', startIndex = 0, className }: SplitTextProps) {
  const { ref, state } = useProgressiveReveal<HTMLSpanElement>(trigger === 'inView');
  const words = text.split(/\s+/).filter(Boolean);

  const wordClass =
    trigger === 'mount'
      ? 'animate-mask-up motion-reduce:animate-none'
      : cn(state === 'hidden' && 'mask-hidden', state === 'shown' && 'animate-mask-up');
  const animated = trigger === 'mount' || state === 'shown';

  return (
    <span ref={ref} className={className} data-reveal={trigger === 'mount' ? 'mount' : state}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          // Words repeat, so position is the only stable identity.
          <Fragment key={i}>
            <span className="mask-line">
              <span
                className={cn('inline-block', wordClass)}
                style={
                  animated ? { animationDelay: `${staggerDelay(startIndex + i)}ms` } : undefined
                }
              >
                {word}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </span>
  );
}
