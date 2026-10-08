'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type FieldValues, useForm, type UseFormProps } from 'react-hook-form';
import { type z } from 'zod';

/**
 * React Hook Form wired to a contracts schema, with the site's form behavior:
 * - validates a field when it loses focus, then live as the user fixes it;
 * - on submit, moves focus to the first invalid field (in field order).
 */
export function useZodForm<Input extends FieldValues, Output extends FieldValues>(
  schema: z.ZodType<Output, Input>,
  options: Omit<UseFormProps<Input, unknown, Output>, 'resolver'> = {},
) {
  return useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    ...options,
  });
}
