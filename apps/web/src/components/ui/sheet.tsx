'use client';

import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { type ReactNode } from 'react';

import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/cn';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export type SheetSide = 'right' | 'left' | 'bottom' | 'full';

export interface SheetContentProps {
  title: ReactNode;
  /** Visually hide the title (it still names the sheet), e.g. for the mobile nav. */
  hideTitle?: boolean;
  description?: ReactNode;
  side?: SheetSide;
  closeLabel?: string;
  className?: string;
  children?: ReactNode;
}

const SIDE: Record<SheetSide, string> = {
  right:
    'inset-y-0 right-0 w-full max-w-md border-l data-[state=closed]:animate-sheet-out-right data-[state=open]:animate-sheet-in-right',
  left: 'inset-y-0 left-0 w-full max-w-md border-r data-[state=closed]:animate-sheet-out-left data-[state=open]:animate-sheet-in-left',
  // 85dvh leaves the page visibly behind the sheet, so it reads as a layer that can be dismissed.
  bottom:
    'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-lg border-t data-[state=closed]:animate-sheet-out-bottom data-[state=open]:animate-sheet-in-bottom',
  full: 'inset-0 bg-bg data-[state=closed]:animate-fade-out data-[state=open]:animate-dialog-in',
};

/**
 * A panel that slides in from an edge (Radix Dialog underneath, so the same focus trap, Esc,
 * restore and scroll lock). `full` covers the screen, for the mobile navigation. Respects safe
 * areas; reduced motion swaps the slide for a crossfade.
 */
export function SheetContent({
  title,
  hideTitle = false,
  description,
  side = 'right',
  closeLabel = 'Close',
  className,
  children,
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-scrim data-[state=closed]:animate-fade-out data-[state=open]:animate-overlay-in" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-modal flex flex-col overflow-y-auto border-border bg-surface pt-safe px-safe pb-safe shadow-overlay',
          SIDE[side],
          'motion-reduce:data-[state=closed]:animate-fade-out motion-reduce:data-[state=open]:animate-fade-in',
          className,
        )}
        {...(description ? {} : { 'aria-describedby': undefined })}
      >
        <div className="flex items-start justify-between gap-4 pb-4">
          <div className={cn('flex min-w-0 flex-col gap-2', hideTitle && 'sr-only')}>
            <DialogPrimitive.Title className="type-h3 text-fg">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-body text-fg-muted">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          {/* No tooltip: the sheet focuses this button on open, and one would pop up every time. */}
          <DialogPrimitive.Close asChild>
            <IconButton label={closeLabel} icon={X} tooltip={false} className="-mr-2 ml-auto" />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
