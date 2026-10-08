'use client';

import { useCallback, useSyncExternalStore } from 'react';

export const MEDIA = {
  reducedMotion: '(prefers-reduced-motion: reduce)',
  /** A mouse or trackpad: the only pointers that get hover effects (04 §6). */
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

/**
 * Whether a media query matches. On the server and during hydration it returns
 * `serverValue`, so the first client render always matches the SSR HTML.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => {
        list.removeEventListener('change', onChange);
      };
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/**
 * The user asked for reduced motion. **Every animation checks this** (or the CSS
 * `motion-reduce:` variant): reduced means instant or a short crossfade, never missing content.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery(MEDIA.reducedMotion);
}

export function useFinePointer(): boolean {
  return useMediaQuery(MEDIA.finePointer);
}
