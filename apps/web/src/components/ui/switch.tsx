'use client';

import { type ComponentProps, type ReactNode, useId } from 'react';

import { cn } from '@/lib/cn';

export interface SwitchProps extends Omit<ComponentProps<'input'>, 'type' | 'role'> {
  label: ReactNode;
  hint?: ReactNode;
}

/**
 * An on/off setting that applies immediately (admin feature toggles). A native checkbox with
 * `role="switch"`, so it's announced as on/off and still works in a form. State shows by thumb
 * position as well as track color.
 */
export function Switch({ label, hint, id, className, disabled, ...props }: SwitchProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 flex-col gap-1 py-2.5">
        <label
          htmlFor={inputId}
          className={cn('text-body', disabled ? 'text-fg-subtle' : 'cursor-pointer text-fg')}
        >
          {label}
        </label>
        {hint ? (
          <p id={hintId} className="text-small text-fg-muted">
            {hint}
          </p>
        ) : null}
      </div>
      <span className="relative mt-2.5 inline-flex h-6 w-11 shrink-0">
        {/* The real control: transparent and 44px tall, centered over the 24px track. */}
        <input
          type="checkbox"
          role="switch"
          id={inputId}
          disabled={disabled}
          aria-describedby={hintId}
          {...props}
          className="peer absolute top-1/2 left-1/2 h-11 w-14 -translate-1/2 cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none h-6 w-11 rounded-full border border-transparent bg-border-strong transition-colors duration-fast peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus peer-disabled:opacity-40"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full border border-transparent bg-surface shadow-raise transition-transform duration-fast ease-out peer-checked:translate-x-5 motion-reduce:transition-none"
        />
      </span>
    </div>
  );
}
