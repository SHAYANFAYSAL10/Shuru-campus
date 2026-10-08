'use client';

import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { type ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { tooltipDelay } from '@/styles/motion';

export interface TooltipProps {
  /** Supplementary text. Never the only source of information (it doesn't open on touch). */
  content: ReactNode;
  /** The trigger: a single focusable element. */
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

/** Opens on hover (after a short delay) and on keyboard focus; Esc closes it. */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={tooltipDelay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            collisionPadding={8}
            className={cn(
              'z-toast max-w-xs rounded-sm bg-fg px-2.5 py-1.5 text-small text-bg shadow-overlay',
              'data-[state=closed]:animate-fade-out data-[state=delayed-open]:animate-fade-in data-[state=instant-open]:animate-fade-in',
              className,
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
