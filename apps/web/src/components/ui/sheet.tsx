'use client';

import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useRef, type MouseEventHandler, type ReactNode } from 'react';

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
  /**
   * Content at the start of the top bar, before the close button (e.g. the logo). With a hidden
   * title, it takes the title's place.
   */
  headerStart?: ReactNode;
  closeLabel?: string;
  /** Clicks anywhere in the sheet, e.g. to close it when a link inside is followed. */
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
  children?: ReactNode;
}

const SIDE: Record<SheetSide, string> = {
  right:
    'inset-y-0 right-0 w-full max-w-md border-l shadow-overlay pt-safe px-safe pb-safe data-[state=closed]:animate-sheet-out-right data-[state=open]:animate-sheet-in-right',
  left: 'inset-y-0 left-0 w-full max-w-md border-r shadow-overlay pt-safe px-safe pb-safe data-[state=closed]:animate-sheet-out-left data-[state=open]:animate-sheet-in-left',
  // 85dvh leaves the page visibly behind the sheet, so it reads as a layer that can be dismissed.
  bottom:
    'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-lg border-t shadow-overlay pt-safe px-safe pb-safe data-[state=closed]:animate-sheet-out-bottom data-[state=open]:animate-sheet-in-bottom',
  // Padding lives on the bar and body instead, so they line up with the site header.
  full: 'inset-0 bg-bg data-[state=closed]:animate-fade-out data-[state=open]:animate-dialog-in',
};

/**
 * A panel that slides in from an edge (Radix Dialog underneath, so the same focus trap, Esc,
 * restore and scroll lock). `full` covers the screen, for the mobile navigation: its top bar has
 * the site header's height and margins, so the close button lands where the menu button was.
 * Respects safe areas; reduced motion swaps the slide for a crossfade.
 */
export function SheetContent({
  title,
  hideTitle = false,
  description,
  side = 'right',
  headerStart,
  closeLabel = 'Close',
  onClick,
  className,
  children,
}: SheetContentProps) {
  const full = side === 'full';
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-scrim data-[state=closed]:animate-fade-out data-[state=open]:animate-overlay-in" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-modal flex flex-col overflow-y-auto overscroll-contain border-border bg-surface',
          SIDE[side],
          'motion-reduce:data-[state=closed]:animate-fade-out motion-reduce:data-[state=open]:animate-fade-in',
          className,
        )}
        {...(description ? {} : { 'aria-describedby': undefined })}
        onClick={onClick}
        // Focus starts on the close button, not on whatever comes first in the bar (e.g. a logo).
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeRef.current?.focus();
        }}
      >
        <div
          data-sheet-bar={full ? '' : undefined}
          className={cn(
            full
              ? 'sticky top-0 z-raised bg-bg pt-[env(safe-area-inset-top)] px-page-safe'
              : 'pb-4',
          )}
        >
          <div
            className={cn(
              'flex w-full',
              full
                ? 'mx-auto min-h-(--sheet-bar-height) max-w-content items-center gap-3'
                : 'items-start gap-4',
            )}
          >
            {headerStart}
            <div
              className={cn(
                'flex min-w-0 flex-col gap-2',
                hideTitle && 'sr-only',
                !headerStart && 'mr-auto',
              )}
            >
              <DialogPrimitive.Title className="type-h3 text-fg">{title}</DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="text-body text-fg-muted">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            {/* No tooltip: the sheet focuses this button on open, and one would pop up every time. */}
            <DialogPrimitive.Close ref={closeRef} asChild>
              <IconButton
                label={closeLabel}
                icon={X}
                tooltip={false}
                className={cn('-mr-2', !headerStart && 'ml-auto')}
              />
            </DialogPrimitive.Close>
          </div>
        </div>
        <div className={cn('min-h-0 flex-1', full && 'flex flex-col px-page-safe pb-safe')}>
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
