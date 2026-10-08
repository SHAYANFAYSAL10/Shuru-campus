'use client';

import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '@/lib/hooks/use-media-query';

/**
 * - `static`: rendered as-is. SSR, no JS, reduced motion, or already on screen at hydration.
 * - `hidden`: below the fold after hydration, waiting to scroll into view.
 * - `shown`: scrolled into view; the entrance animation plays once.
 */
export type RevealState = 'static' | 'hidden' | 'shown';

/**
 * Progressive reveal (04 §6). Content is in the SSR HTML and visible; it's only hidden once JS
 * has hydrated *and* the element is below the fold, so first paint never waits for JS and
 * nothing on screen blinks out. Each element reveals once and never re-animates.
 */
export function useProgressiveReveal<T extends Element>(enabled = true) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const [state, setState] = useState<RevealState>('static');

  useEffect(() => {
    const element = ref.current;
    if (!enabled || reduced || !element) return;

    let initial = true;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (initial) {
          initial = false;
          // On screen, or already scrolled past: leave it exactly as rendered.
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            observer.disconnect();
            return;
          }
          setState('hidden');
        } else if (entry.isIntersecting) {
          setState('shown');
          observer.disconnect();
        }
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [enabled, reduced]);

  return { ref, state: reduced ? 'static' : state } as const;
}
