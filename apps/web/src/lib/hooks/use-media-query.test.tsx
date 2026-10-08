import { renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { useHydrated } from '@/lib/hooks/use-hydrated';
import {
  MEDIA,
  useFinePointer,
  useMediaQuery,
  useReducedMotion,
} from '@/lib/hooks/use-media-query';
import { setMediaQuery } from '@/test/media';

function Probe({ query, serverValue }: { query: string; serverValue?: boolean }) {
  return <>{String(useMediaQuery(query, serverValue))}</>;
}

function HydratedProbe() {
  return <>{String(useHydrated())}</>;
}

describe('useMediaQuery', () => {
  it('reflects the current match on the client', () => {
    setMediaQuery(MEDIA.reducedMotion, true);
    expect(renderHook(() => useReducedMotion()).result.current).toBe(true);
    expect(renderHook(() => useFinePointer()).result.current).toBe(false);
  });

  it('renders the server value during SSR, whatever the client would say', () => {
    setMediaQuery('(min-width: 1px)', true);
    expect(renderToString(<Probe query="(min-width: 1px)" />)).toBe('false');
    expect(renderToString(<Probe query="(min-width: 1px)" serverValue />)).toBe('true');
  });
});

describe('useHydrated', () => {
  it('is false in SSR HTML and true once mounted', () => {
    expect(renderToString(<HydratedProbe />)).toBe('false');
    expect(renderHook(() => useHydrated()).result.current).toBe(true);
  });
});
