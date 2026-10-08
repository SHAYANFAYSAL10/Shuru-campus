// A tiny toast queue. `toast()` can be called from anywhere (event handlers, form submits);
// the <Toaster> mounted in the root layout renders the queue.

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds on screen. The timer pauses on hover, focus and when the window is hidden. */
  duration?: number;
}

export interface ToastItem extends Required<Omit<ToastInput, 'description'>> {
  id: number;
  description: string | undefined;
}

/** Errors stay longer: they usually ask the reader to do something. */
export const TOAST_DURATION: Record<ToastTone, number> = {
  info: 5000,
  success: 5000,
  error: 8000,
};

/** Older toasts are dropped beyond this, so the stack never covers the page. */
export const MAX_TOASTS = 3;

type Listener = () => void;

let items: readonly ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function emit(next: readonly ToastItem[]) {
  items = next;
  for (const listener of listeners) listener();
}

/** Shows a toast and returns its id. */
export function toast({ title, description, tone = 'info', duration }: ToastInput): number {
  const id = nextId++;
  const item: ToastItem = {
    id,
    title,
    description,
    tone,
    duration: duration ?? TOAST_DURATION[tone],
  };
  emit([...items, item].slice(-MAX_TOASTS));
  return id;
}

export function dismissToast(id: number): void {
  emit(items.filter((item) => item.id !== id));
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts(): readonly ToastItem[] {
  return items;
}

const EMPTY: readonly ToastItem[] = [];

/** Server snapshot: no toasts. */
export function getServerToasts(): readonly ToastItem[] {
  return EMPTY;
}

/** Test helper. */
export function clearToasts(): void {
  emit(EMPTY);
}
