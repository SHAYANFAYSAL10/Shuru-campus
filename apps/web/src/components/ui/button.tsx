import { LoaderCircle } from 'lucide-react';
import { Slot } from 'radix-ui';
import { type ComponentProps, type MouseEvent } from 'react';

import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'onBrand' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

// docs/10-design-guidelines.md → A6. Hover and press styles are only applied while the button
// is interactive, so disabled and loading buttons don't react.
const VARIANT: Record<ButtonVariant, { rest: string; interactive: string }> = {
  primary: {
    rest: 'bg-accent text-on-accent',
    interactive: 'hover:-translate-y-px hover:bg-accent-hover',
  },
  secondary: {
    rest: 'border-border-strong text-fg',
    interactive: 'hover:bg-bg-alt',
  },
  ghost: {
    rest: 'text-fg',
    interactive: 'hover:bg-bg-alt',
  },
  // On the lake band (use inside `surface-brand`, which also switches the focus ring to accent).
  onBrand: {
    rest: 'bg-on-brand text-brand-surface',
    interactive: 'hover:bg-on-brand-hover',
  },
  link: {
    rest: 'h-auto rounded-sm px-0 text-accent-text underline decoration-1 underline-offset-3',
    interactive: 'hover:decoration-2',
  },
};

const SIZE: Record<ButtonSize, string> = {
  // 36px tall, with the touch target extended to 44px.
  sm: 'hit-target h-9 px-4 text-small',
  md: 'h-11 px-5 text-body',
  lg: 'h-13 px-7 text-body',
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  interactive?: boolean;
}

/** Button classes, for elements that look like a button but aren't one (see `asChild`). */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  interactive = true,
}: ButtonStyleOptions = {}): string {
  const styles = VARIANT[variant];
  return cn(
    // A transparent border keeps a visible outline in forced-colors mode.
    'relative inline-flex items-center justify-center gap-2 rounded-full border border-transparent font-medium whitespace-nowrap transition duration-fast ease-out select-none',
    SIZE[size],
    styles.rest,
    interactive
      ? cn(styles.interactive, 'cursor-pointer active:scale-98 motion-reduce:active:scale-100')
      : 'cursor-not-allowed opacity-40',
  );
}

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
