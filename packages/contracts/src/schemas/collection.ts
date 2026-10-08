import { z } from 'zod';

/** Collections are wrapped as `{ items: T[] }` (docs/06-api.md). */
export function collectionOf<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item) });
}
