'use client';

import { type ClassValue } from 'clsx';
import { CircleAlert } from 'lucide-react';
import { createContext, type ReactNode, use, useId } from 'react';

import { cn } from '@/lib/cn';

interface FieldContextValue {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

interface ControlProps {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
}

/**
 * Wires a control to its `Field`: the label's id, hint and error descriptions, and the invalid
 * state. Props passed directly to the control win.
 */
export function useFieldControl(props: ControlProps) {
  const field = use(FieldContext);
  const describedBy = [field?.describedBy, props['aria-describedby']].filter(Boolean).join(' ');
  return {
    id: props.id ?? field?.id,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': props['aria-invalid'] ?? (field?.invalid ? true : undefined),
  };
}

export interface FieldProps {
  label: ReactNode;
  /** Help shown under the label, before the control. */
  hint?: ReactNode;
  /** Error message. Marks the control invalid and is announced with it. */
  error?: string;
  /** Adds "(optional)" to the label. Fields are required unless marked. */
  optional?: boolean;
  /** Visually hide the label (it stays the accessible name). */
  hideLabel?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Label, hint, control and error, linked for assistive tech: the control is labelled by the
 * label and described by the hint and error (`aria-describedby`). Errors carry an icon as well
 * as color (A5).
 */
export function Field({
  label,
  hint,
  error,
  optional = false,
  hideLabel = false,
  id,
  className,
  children,
}: FieldProps) {
  const autoId = useId();
  const controlId = id ?? `${autoId}-control`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const value: FieldContextValue = {
    id: controlId,
    describedBy: [hintId, errorId].filter(Boolean).join(' ') || undefined,
    invalid: Boolean(error),
  };

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <label
        htmlFor={controlId}
        className={cn('text-small font-medium text-fg', hideLabel && 'sr-only')}
      >
        {label}
        {optional ? (
          <>
            {' '}
            <span className="font-normal text-fg-subtle">(optional)</span>
          </>
        ) : null}
      </label>
      {hint ? (
        <p id={hintId} className="-mt-1 text-small text-fg-muted">
          {hint}
        </p>
      ) : null}
      <FieldContext value={value}>{children}</FieldContext>
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-small text-danger">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

/** Shared look of text-like controls (A6 → Input). */
export function controlClasses(...extra: ClassValue[]): string {
  return cn(
    'w-full min-w-0 rounded-sm border border-border-strong bg-surface text-body text-fg transition-colors duration-fast ease-out placeholder:text-fg-subtle',
    'hover:not-disabled:not-aria-invalid:border-fg-subtle',
    'focus-visible:border-focus',
    'aria-invalid:border-danger',
    'disabled:cursor-not-allowed disabled:bg-bg-alt disabled:text-fg-subtle',
    ...extra,
  );
}
