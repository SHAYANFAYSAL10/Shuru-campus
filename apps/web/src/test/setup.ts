import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { resetMediaQueries } from '@/test/media';

// jsdom has no layout engine, so the browser APIs our components feature-detect are stubbed.
// Tests drive them through the helpers in `src/test/`.

class StubIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly scrollMargin = '0px';
  readonly thresholds = [0];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];
}

class StubResizeObserver implements ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

if (typeof window !== 'undefined') {
  globalThis.IntersectionObserver = StubIntersectionObserver;
  globalThis.ResizeObserver = StubResizeObserver;
}

afterEach(() => {
  cleanup();
  resetMediaQueries();
});
