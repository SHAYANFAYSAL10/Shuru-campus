'use client';

import { type ComponentProps } from 'react';

import { controlClasses, useFieldControl } from '@/components/ui/field';

/** Multi-line input. Grows with its content where supported, and can be resized vertically. */
export function Textarea({ className, rows = 5, ...props }: ComponentProps<'textarea'>) {
  const field = useFieldControl(props);
  return (
    <textarea
      rows={rows}
      {...props}
      {...field}
      className={controlClasses(
        'field-sizing-content max-h-96 min-h-32 resize-y px-3 py-2.5',
        className,
      )}
    />
  );
}
