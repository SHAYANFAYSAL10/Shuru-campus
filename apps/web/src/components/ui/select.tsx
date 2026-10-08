'use client';

import { ChevronDown } from 'lucide-react';
import { type ComponentProps } from 'react';

import { controlClasses, useFieldControl } from '@/components/ui/field';
import { cn } from '@/lib/cn';

/**
 * A styled native <select>: the platform picker on touch devices, full keyboard and
 * screen-reader support, and it works without JS.
 */
export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  const field = useFieldControl(props);
  return (
    <div className={cn('relative min-w-0', className)}>
      <select
        {...props}
        {...field}
        className={controlClasses('h-11 cursor-pointer appearance-none pr-10 pl-3')}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-fg-muted"
        strokeWidth={1.5}
      />
    </div>
  );
}
