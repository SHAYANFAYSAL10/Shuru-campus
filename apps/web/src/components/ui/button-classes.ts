import { cn } from '@/lib/cn';

// Plain module (no "use client"), so Server Components can style links as buttons too.

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
