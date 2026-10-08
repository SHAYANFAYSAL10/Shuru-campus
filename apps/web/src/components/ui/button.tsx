'use client';

import { LoaderCircle } from 'lucide-react';
import { Slot } from 'radix-ui';
import { type ComponentProps, type MouseEvent } from 'react';

import { buttonClasses, type ButtonSize, type ButtonVariant } from '@/components/ui/button-classes';
import { cn } from '@/lib/cn';

export {
  buttonClasses,
  type ButtonSize,
  type ButtonStyleOptions,
  type ButtonVariant,
} from '@/components/ui/button-classes';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Shows a spinner in place of the label and blocks clicks. The button keeps its width and its
   * focus (it uses aria-disabled, not disabled), and announces `loadingLabel`.
   */
  loading?: boolean;
  loadingLabel?: string;
  /** Render the child element (e.g. a link) with button styles instead of a <button>. */
  asChild?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel = 'Loading',
  asChild = false,
  disabled = false,
  type = 'button',
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const classes = cn(
    buttonClasses({ variant, size, interactive: !disabled && !loading }),
    loading && 'cursor-progress opacity-100',
    className,
  );

  if (asChild) {
    return (
      <Slot.Root className={classes} {...rest}>
        {children}
      </Slot.Root>
    );
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      className={classes}
      onClick={handleClick}
      {...rest}
    >
      <span
        aria-hidden={loading || undefined}
        className={cn('inline-flex items-center gap-2', loading && 'invisible')}
      >
        {children}
      </span>
      {loading ? (
        <span className="absolute inset-0 inline-flex items-center justify-center">
          <LoaderCircle
            aria-hidden="true"
            className="size-5 animate-spin motion-reduce:animate-none"
            strokeWidth={1.5}
          />
          <span className="sr-only">{loadingLabel}</span>
        </span>
      ) : null}
    </button>
  );
}
