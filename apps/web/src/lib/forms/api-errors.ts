import { type FieldValues, type Path, type UseFormSetError } from 'react-hook-form';

import { type ApiError } from '@campus/contracts';

/**
 * Puts the API's validation details on the matching form fields and focuses the first one.
 * Returns the messages that belong to no field (or the top-level message when there are no
 * details), for a form-level error.
 */
export function applyApiErrors<T extends FieldValues>(
  apiError: ApiError,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string[] {
  const { details = [], message } = apiError.error;
  if (details.length === 0) return [message];

  const unmatched: string[] = [];
  let focused = false;
  for (const detail of details) {
    const field = fields.find((name) => name === detail.path);
    if (!field) {
      unmatched.push(detail.message);
      continue;
    }
    setError(field, { type: 'server', message: detail.message }, { shouldFocus: !focused });
    focused = true;
  }
  return unmatched;
}
