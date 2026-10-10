'use client';

import { type ReactNode, useLayoutEffect, useRef } from 'react';

import {
  handoffTransform,
  isOnScreen,
  recordHandoff,
  takeHandoff,
  type LineBox,
} from '@/lib/begin-line-handoff';
import { cn } from '@/lib/cn';
import { MEDIA } from '@/lib/hooks/use-media-query';
import { cssEase, duration } from '@/styles/motion';

interface HandoffProps {
  children: ReactNode;
  className?: string;
}

function boxOf(element: Element): LineBox {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
}

/**
 * Wraps the hero's begin line. As it leaves the page, it records where the line was, if any of
 * it was on screen, for a `BeginLineHandoffTarget` to fly from (`lib/begin-line-handoff.ts`).
 */
export function BeginLineHandoffSource({ children, className }: HandoffProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    // Layout-effect cleanups of a removed tree run before its DOM is detached, so the line can
    // still be measured where the reader last saw it.
    return () => {
      if (!element?.isConnected) return;
      const box = boxOf(element);
      if (isOnScreen(box, { width: window.innerWidth, height: window.innerHeight })) {
        recordHandoff(box, performance.now());
      }
    };
  }, []);

  return (
    <span ref={ref} className={cn('block', className)}>
      {children}
    </span>
  );
}

/**
 * Wraps the nav's begin line. When it appears in the same commit that removed the hero's line, it
 * starts where that line was and settles into place (transform only). Reduced motion: it's
 * simply there.
 */
export function BeginLineHandoffTarget({ children, className }: HandoffProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    // Taken even under reduced motion, so a hand-off never lingers for a later mount.
    const from = takeHandoff(performance.now(), duration.base);
    if (!element || !from || window.matchMedia(MEDIA.reducedMotion).matches) return;

    const move = handoffTransform(from, boxOf(element));
    if (!move) return;
    const flight = element.animate(
      [
        { transform: `translate(${move.x}px, ${move.y}px) scaleX(${move.scaleX})` },
        { transform: 'none' },
      ],
      { duration: duration.story, easing: cssEase('inOut') },
    );
    return () => {
      flight.cancel();
    };
  }, []);

  return (
    <span ref={ref} className={cn('block origin-top-left', className)}>
      {children}
    </span>
  );
}
