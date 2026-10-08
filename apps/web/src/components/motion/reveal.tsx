'use client';

import { type ComponentProps } from 'react';

import { useProgressiveReveal } from '@/components/motion/use-progressive-reveal';
import { cn } from '@/lib/cn';
import { staggerDelay } from '@/styles/motion';

export interface RevealProps extends ComponentProps<'div'> {
  /** Position in a staggered group: adds 50ms per step, capped at 400ms. */
  index?: number;
}

/** Fades and lifts its content in the first time it scrolls into view. Below the fold only. */
export function Reveal({ index = 0, className, style, children, ...rest }: RevealProps) {
  const { ref, state } = useProgressiveReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-reveal={state}
      className={cn(
        state === 'hidden' && 'translate-y-(--reveal-distance) opacity-0',
        state === 'shown' && 'animate-reveal',
        className,
      )}
      style={state === 'shown' ? { animationDelay: `${staggerDelay(index)}ms`, ...style } : style}
      {...rest}
    >
      {children}
    </div>
  );
}
