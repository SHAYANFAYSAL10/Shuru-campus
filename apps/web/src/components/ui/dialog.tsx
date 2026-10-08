'use client';

import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { type ReactNode } from 'react';

import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps {
  /** Required: names the dialog for screen readers. */
  title: ReactNode;
  description?: ReactNode;
  /** Actions, right-aligned under the body (stacked on narrow screens). */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Label of the close button. */
  closeLabel?: string;
  className?: string;
  children?: ReactNode;
}

const WIDTH = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' } as const;

/**
 * A modal dialog (Radix): focus is trapped inside and returns to the trigger on close, Esc and
 * the backdrop close it, and page scroll is locked without jumping. The backdrop is the scroll
 * container, so tall content scrolls instead of being cut off on small screens and at zoom.
 */
export function DialogContent({
  title,
  description,
  footer,
  size = 'md',
  closeLabel = 'Close',
  className,
  children,
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-modal grid place-items-center overflow-y-auto bg-scrim pt-safe px-safe pb-safe data-[state=closed]:animate-fade-out data-[state=open]:animate-overlay-in">
        <DialogPrimitive.Content
          className={cn(
            'relative w-full rounded-lg border border-border bg-surface p-6 shadow-overlay sm:p-8',
            'data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in',
            'motion-reduce:data-[state=closed]:animate-fade-out motion-reduce:data-[state=open]:animate-fade-in',
            WIDTH[size],
            className,
          )}
          {...(description ? {} : { 'aria-describedby': undefined })}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <DialogPrimitive.Title className="type-h3 text-fg">{title}</DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="text-body text-fg-muted">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            {/* No tooltip: the dialog focuses this button on open, and one would pop up every time. */}
            <DialogPrimitive.Close asChild>
              <IconButton
                label={closeLabel}
                icon={X}
                size="sm"
                tooltip={false}
                className="-mt-1 -mr-2"
              />
            </DialogPrimitive.Close>
          </div>
          {children ? <div className="mt-6">{children}</div> : null}
          {footer ? (
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}
