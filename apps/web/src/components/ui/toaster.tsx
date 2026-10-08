'use client';

import { CircleAlert, CircleCheck, Info, type LucideIcon, X } from 'lucide-react';
import { Toast as ToastPrimitive } from 'radix-ui';
import { useSyncExternalStore } from 'react';

import { cn } from '@/lib/cn';
import {
  dismissToast,
  getServerToasts,
  getToasts,
  subscribeToasts,
  type ToastTone,
} from '@/lib/toast';

const TONE: Record<ToastTone, { icon: LucideIcon; bar: string; iconColor: string }> = {
  info: { icon: Info, bar: 'border-l-brand', iconColor: 'text-brand' },
  success: { icon: CircleCheck, bar: 'border-l-success', iconColor: 'text-success' },
  error: { icon: CircleAlert, bar: 'border-l-danger', iconColor: 'text-danger' },
};

/**
 * Renders `toast()` calls (A6 → Toast). Radix announces each toast in a live region (errors
 * assertively, the rest politely), pauses the timer on hover, focus and window blur, supports
 * swipe-to-dismiss, and F8 jumps to the stack. Mount once, in the root layout.
 */
export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getServerToasts);

  return (
    <ToastPrimitive.Provider swipeDirection="right" label="Notification">
      {toasts.map((item) => {
        const tone = TONE[item.tone];
        const Icon = tone.icon;
        return (
          <ToastPrimitive.Root
            key={item.id}
            type={item.tone === 'error' ? 'foreground' : 'background'}
            duration={item.duration}
            onOpenChange={(open) => {
              if (!open) dismissToast(item.id);
            }}
            className={cn(
              'flex w-full items-start gap-3 rounded-md border border-l-3 border-border bg-surface p-4 shadow-overlay',
              tone.bar,
              'data-[state=closed]:animate-fade-out data-[state=open]:animate-toast-in motion-reduce:data-[state=open]:animate-fade-in',
              'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=end]:animate-toast-swipe-out data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)',
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn('mt-0.5 size-5 shrink-0', tone.iconColor)}
              strokeWidth={1.5}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <ToastPrimitive.Title className="text-small font-medium text-fg">
                {item.title}
              </ToastPrimitive.Title>
              {item.description ? (
                <ToastPrimitive.Description className="text-small text-fg-muted">
                  {item.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
            <ToastPrimitive.Close
              aria-label="Dismiss notification"
              className="hit-target -mt-1 -mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-bg-alt hover:text-fg"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={1.5} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className="fixed right-0 bottom-0 z-toast flex w-full flex-col gap-2 px-safe pb-safe sm:max-w-sm sm:pr-6 sm:pb-6" />
    </ToastPrimitive.Provider>
  );
}
