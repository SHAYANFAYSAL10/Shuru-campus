// A controllable `window.matchMedia` for tests: `setMediaQuery('(prefers-reduced-motion: reduce)', true)`.

const matches = new Map<string, boolean>();

export function setMediaQuery(query: string, value: boolean): void {
  matches.set(query, value);
}

export function resetMediaQueries(): void {
  matches.clear();
}

function matchMedia(query: string): MediaQueryList {
  return {
    media: query,
    get matches() {
      return matches.get(query) ?? false;
    },
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  };
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMedia });
}
