'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

import { initialHeaderScroll, nextHeaderScroll, type HeaderScrollState } from '@/lib/header-scroll';

export type HeaderScrollView = Pick<HeaderScrollState, 'condensed' | 'hidden'>;

/**
 * Drives the header's scroll states from `window` scroll events (one update per frame). The
 * header stays in view while focus is inside it or while `pinned` (e.g. its menu is open).
 * Re-renders only when `condensed` or `hidden` actually change.
 */
export function useHeaderScroll(
  ref: RefObject<HTMLElement | null>,
  pinned = false,
): HeaderScrollView {
  const [view, setView] = useState<HeaderScrollView>(initialHeaderScroll);
  const pinnedRef = useRef(pinned);
  const updateRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;

    // Measure from where the page starts, so a restored scroll position is not read as scroll-down.
    let state: HeaderScrollState = { ...initialHeaderScroll, y: Math.max(window.scrollY, 0) };
    let focusWithin = header.contains(document.activeElement);
    let frame = 0;

    const update = () => {
      frame = 0;
      state = nextHeaderScroll(state, {
        y: window.scrollY,
        pinned: focusWithin || pinnedRef.current,
        revealZone: header.offsetHeight,
      });
      const { condensed, hidden } = state;
      setView((prev) =>
        prev.condensed === condensed && prev.hidden === hidden ? prev : { condensed, hidden },
      );
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };
    const onFocusIn = () => {
      focusWithin = true;
      schedule();
    };
    const onFocusOut = (event: FocusEvent) => {
      focusWithin = event.relatedTarget instanceof Node && header.contains(event.relatedTarget);
      schedule();
    };

    updateRef.current = schedule;
    // A page restored mid-scroll (back/forward, reload) starts condensed.
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    header.addEventListener('focusin', onFocusIn);
    header.addEventListener('focusout', onFocusOut);
    return () => {
      cancelAnimationFrame(frame);
      updateRef.current = () => undefined;
      window.removeEventListener('scroll', schedule);
      header.removeEventListener('focusin', onFocusIn);
      header.removeEventListener('focusout', onFocusOut);
    };
  }, [ref]);

  useEffect(() => {
    pinnedRef.current = pinned;
    updateRef.current();
  }, [pinned]);

  return view;
}
