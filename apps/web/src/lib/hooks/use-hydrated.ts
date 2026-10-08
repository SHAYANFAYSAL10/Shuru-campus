'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

/**
 * `false` on the server and during hydration, `true` afterwards. For UI that only works with
 * JS (a pause button, a theme-dependent state), so the SSR HTML and first render agree.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
