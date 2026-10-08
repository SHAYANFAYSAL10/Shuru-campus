'use client';

import 'lenis/dist/lenis.css';

import { useEffect } from 'react';

import { useFinePointer, useReducedMotion } from '@/lib/hooks/use-media-query';

import type Lenis from 'lenis';

/**
 * Optional Lenis smoothing of *native* scroll (no scroll-jacking). It only loads on fine
 * pointers without reduced motion; touch devices and reduced motion keep plain native scroll.
 * Lenis is code-split and fetched only when it will actually run.
 */
export function SmoothScroll({ enabled = true }: { enabled?: boolean }) {
  const finePointer = useFinePointer();
  const reduced = useReducedMotion();
  const active = enabled && finePointer && !reduced;

  useEffect(() => {
    if (!active) return;
    let instance: Lenis | undefined;
    let cancelled = false;
    void import('lenis').then(({ default: LenisClass }) => {
      if (cancelled) return;
      instance = new LenisClass({ autoRaf: true, anchors: true });
    });
    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, [active]);

  return null;
}
