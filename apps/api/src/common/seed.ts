import { type z } from 'zod';

/** Thrown at boot when seed data doesn't match its contract schema. */
export class SeedError extends Error {
  constructor(label: string, error: z.ZodError) {
    const problems = error.issues.map(
      (issue) => `  • ${issue.path.map(String).join('.') || '(root)'}: ${issue.message}`,
    );
    super(`Invalid ${label} seed data:\n${problems.join('\n')}`);
    this.name = 'SeedError';
  }
}

/**
 * Parses seed data against its contract schema so a bad seed fails the boot, not a request
 * (docs/03-architecture.md → Phase 1: no database).
 */
export function validateSeed<T extends z.ZodType>(
  label: string,
  schema: T,
  value: unknown,
): z.output<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new SeedError(label, parsed.error);
  return parsed.data;
}

/** An array schema whose items must have unique `key` values. */
export function uniqueBy<T extends z.ZodType>(
  items: z.ZodArray<T>,
  key: (item: z.output<T>) => string,
  message: string,
) {
  return items.refine((list) => new Set(list.map(key)).size === list.length, { error: message });
}
