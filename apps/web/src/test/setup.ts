import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { resetIntersectionObservers, TestIntersectionObserver } from '@/test/intersection';
import { resetMediaQueries } from '@/test/media';

// jsdom has no layout engine, so the browser APIs our components feature-detect are stubbed.
// Tests drive them through the helpers in `src/test/`.

class StubResizeObserver implements ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

if (typeof window !== 'undefined') {
  globalThis.IntersectionObserver = TestIntersectionObserver;
  globalThis.ResizeObserver = StubResizeObserver;
}

afterEach(() => {
  cleanup();
  resetMediaQueries();
  resetIntersectionObservers();
});
