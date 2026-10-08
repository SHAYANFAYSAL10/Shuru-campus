// A controllable IntersectionObserver for tests. Components observe as usual, and tests call
// `intersect(element, { isIntersecting, top })` to deliver an entry.

import { vi } from 'vitest';

interface Observer {
  callback: IntersectionObserverCallback;
  targets: Set<Element>;
  instance: IntersectionObserver;
}

const observers = new Set<Observer>();

export class TestIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly scrollMargin = '0px';
  readonly thresholds = [0];
  private readonly record: Observer;

  constructor(callback: IntersectionObserverCallback) {
    this.record = { callback, targets: new Set(), instance: this };
    observers.add(this.record);
  }

  observe = vi.fn((target: Element) => {
    this.record.targets.add(target);
  });
  unobserve = vi.fn((target: Element) => {
    this.record.targets.delete(target);
  });
  disconnect = vi.fn(() => {
    this.record.targets.clear();
    observers.delete(this.record);
  });
  takeRecords = () => [];
}

/** Delivers an intersection entry for `target` to every observer watching it. */
export function intersect(
  target: Element,
  { isIntersecting, top = isIntersecting ? 0 : 1000 }: { isIntersecting: boolean; top?: number },
): void {
  const rect = { top, bottom: top + 100, left: 0, right: 100, width: 100, height: 100 };
  const entry = {
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: { ...rect, x: 0, y: top, toJSON: () => rect } as DOMRectReadOnly,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
    time: 0,
  } satisfies IntersectionObserverEntry;
  for (const observer of [...observers]) {
    if (observer.targets.has(target)) observer.callback([entry], observer.instance);
  }
}

export function resetIntersectionObservers(): void {
  observers.clear();
}
