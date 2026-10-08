// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearToasts,
  dismissToast,
  getServerToasts,
  getToasts,
  MAX_TOASTS,
  subscribeToasts,
  toast,
  TOAST_DURATION,
} from '@/lib/toast';

afterEach(() => {
  clearToasts();
});

describe('toast store', () => {
  it('queues toasts with tone-based durations', () => {
    toast({ title: 'Saved' });
    toast({ title: "Couldn't send", tone: 'error' });
    const [info, error] = getToasts();
    expect(info).toMatchObject({ title: 'Saved', tone: 'info', duration: TOAST_DURATION.info });
    expect(error).toMatchObject({ tone: 'error', duration: TOAST_DURATION.error });
    expect(TOAST_DURATION.error).toBeGreaterThan(TOAST_DURATION.info);
  });

  it('honors a custom duration', () => {
    toast({ title: 'Quick', duration: 1000 });
    expect(getToasts()[0]?.duration).toBe(1000);
  });

  it(`keeps only the newest ${String(MAX_TOASTS)}`, () => {
    for (let i = 1; i <= MAX_TOASTS + 2; i += 1) toast({ title: `Toast ${String(i)}` });
    expect(getToasts().map((t) => t.title)).toEqual(['Toast 3', 'Toast 4', 'Toast 5']);
  });

  it('dismisses by id and notifies subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToasts(listener);
    const id = toast({ title: 'Bye' });
    dismissToast(id);
    expect(getToasts()).toHaveLength(0);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    toast({ title: 'Unheard' });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('has an empty, stable server snapshot', () => {
    toast({ title: 'Client only' });
    expect(getServerToasts()).toEqual([]);
    expect(getServerToasts()).toBe(getServerToasts());
  });
});
