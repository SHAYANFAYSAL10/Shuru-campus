'use client';

import { type LucideIcon } from 'lucide-react';
import * as m from 'motion/react-m';
import { useId } from 'react';

import { cn } from '@/lib/cn';
import { spring } from '@/styles/motion';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export interface SegmentedControlProps<T extends string> {
  /** Names the group for screen readers (and visually, unless `hideLegend`). */
  legend: string;
  hideLegend?: boolean;
  options: readonly SegmentedOption<T>[];
  /** `undefined` selects nothing (e.g. before the current value is known). */
  value: T | undefined;
  onValueChange: (value: T) => void;
  /** Form field name. Defaults to a unique id. */
  name?: string;
  size?: 'sm' | 'md';
  /** Show icons only; labels stay available to screen readers. */
  iconOnly?: boolean;
  className?: string;
}

/**
 * A single-choice toggle (pricing period, theme). Built on native radio inputs, so arrow keys
 * move the selection, Tab enters and leaves the group, and it works inside forms without JS.
 * The thumb springs between options (spring.snappy); reduced motion makes it jump.
 */
export function SegmentedControl<T extends string>({
  legend,
  hideLegend = false,
  options,
  value,
  onValueChange,
  name,
  size = 'md',
  iconOnly = false,
  className,
}: SegmentedControlProps<T>) {
  const id = useId();
  const groupName = name ?? id;

  return (
    <fieldset className={cn('inline-flex min-w-0 flex-col gap-2', className)}>
      <legend className={cn(hideLegend ? 'sr-only' : 'mb-2 text-small text-fg-muted')}>
        {legend}
      </legend>
      <div className="inline-flex max-w-full flex-wrap gap-1 self-start rounded-full bg-bg-alt p-1">
        {options.map((option) => {
          const checked = option.value === value;
          const Icon = option.icon;
          return (
            <label
              key={option.value}
              className={cn(
                'relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-full text-fg-muted focus-ring-within transition-colors select-none hover:text-fg has-checked:text-fg',
                size === 'sm'
                  ? 'h-9 min-w-9 text-small pointer-coarse:h-11 pointer-coarse:min-w-11'
                  : 'h-10 min-w-10 text-body pointer-coarse:h-11',
                iconOnly ? 'px-2' : size === 'sm' ? 'px-3' : 'px-4',
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={checked}
                onChange={() => {
                  onValueChange(option.value);
                }}
                className="peer sr-only"
              />
              {checked ? (
                <m.span
                  aria-hidden="true"
                  layoutId={`${id}-thumb`}
                  transition={spring.snappy}
                  className="absolute inset-0 rounded-full bg-surface shadow-raise"
                />
              ) : null}
              <span className="relative inline-flex items-center gap-2">
                {Icon ? (
                  <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
                ) : null}
                <span className={cn(iconOnly && 'sr-only')}>{option.label}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
