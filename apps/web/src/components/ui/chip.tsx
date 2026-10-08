import { Check } from 'lucide-react';
import { type ComponentProps } from 'react';

import { cn } from '@/lib/cn';

export interface ChipProps extends Omit<ComponentProps<'button'>, 'aria-pressed'> {
  /** On/off state, announced as "pressed". */
  selected: boolean;
}

/**
 * A toggle chip for filters ("Workspace", "Events"). Selected chips invert to fg-on-bg and gain
 * a check mark, so the state never relies on color alone.
 */
export function Chip({ selected, disabled = false, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        'hit-target inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-small font-medium whitespace-nowrap transition duration-fast ease-out select-none',
        selected ? 'border-fg bg-fg text-bg' : 'border-border-strong text-fg',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : cn('cursor-pointer active:scale-98', !selected && 'hover:bg-bg-alt'),
        className,
      )}
      {...rest}
    >
      {selected ? <Check aria-hidden="true" className="-ml-1 size-4" strokeWidth={1.5} /> : null}
      {children}
    </button>
  );
}
