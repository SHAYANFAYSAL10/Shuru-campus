'use client';

import { type ComponentProps } from 'react';

import { controlClasses, useFieldControl } from '@/components/ui/field';

/** Single-line text input, 44px tall. 16px text, so iOS doesn't zoom on focus. */
export function Input({ className, ...props }: ComponentProps<'input'>) {
  const field = useFieldControl(props);
  return <input {...props} {...field} className={controlClasses('h-11 px-3', className)} />;
}
