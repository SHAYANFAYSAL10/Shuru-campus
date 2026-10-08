'use client';

import { useSyncExternalStore } from 'react';

const MINUTE_MS = 60_000;

function subscribe(onChange: () => void) {
  let interval: ReturnType<typeof setInterval> | undefined;
  // Tick on the minute boundary, then every minute.
  const timeout = setTimeout(
    () => {
      onChange();
      interval = setInterval(onChange, MINUTE_MS);
    },
    MINUTE_MS - (Date.now() % MINUTE_MS),
  );
  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
  };
}

/** The current time, truncated to the minute. Stable within a minute. */
function getSnapshot(): number {
  return Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS;
}

function getServerSnapshot(): null {
  return null;
}

/**
 * The current minute, re-rendering when it changes. `null` on the server and during hydration,
 * so time-dependent text never causes a hydration mismatch; render a placeholder for `null`.
 */
export function useNowMinute(): Date | null {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return now === null ? null : new Date(now);
}
