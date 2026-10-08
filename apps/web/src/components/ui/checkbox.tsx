'use client';

import { Check, CircleAlert } from 'lucide-react';
import { type ComponentProps, type ReactNode, useId } from 'react';

import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
}

/**
 * A native checkbox with a custom box. The whole row is the click target (44px tall), and the
 * checked state shows a check mark, not just a fill.
 */
export function Checkbox({ label, hint, error, id, className, disabled, ...props }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId, props['aria-describedby']].filter(Boolean).join(' ');

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'flex min-h-11 items-start gap-3 py-2.5 text-body text-fg',
          disabled ? 'cursor-not-allowed text-fg-subtle' : 'cursor-pointer',
        )}
      >
        <span className="relative mt-0.5 inline-flex size-5 shrink-0">
          <input
            type="checkbox"
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            {...props}
            aria-describedby={describedBy || undefined}
            className="peer size-5 cursor-pointer appearance-none rounded-sm border border-border-strong bg-surface transition-colors duration-instant checked:border-fg checked:bg-fg disabled:cursor-not-allowed disabled:bg-bg-alt aria-invalid:border-danger"
          />
          <Check
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto size-4 text-bg opacity-0 peer-checked:opacity-100"
            strokeWidth={2}
          />
        </span>
        <span className="min-w-0">{label}</span>
      </label>
      {hint ? (
        <p id={hintId} className="ml-8 text-small text-fg-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="ml-8 flex items-start gap-1.5 text-small text-danger">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
