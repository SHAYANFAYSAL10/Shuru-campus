import { z } from 'zod';

/** `HH:mm`, 24-hour clock. */
export const TimeOfDay = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: 'Use 24-hour time, e.g. 09:00.' });
export type TimeOfDay = z.infer<typeof TimeOfDay>;

/** Minutes since midnight for a validated `HH:mm`. */
export function toMinutes(time: TimeOfDay): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export const Email = z.email({ error: 'Enter a valid email address.' }).max(254);

/** Absolute https URL (admin rule: every configurable URL is https). */
export const HttpsUrl = z.url({
  protocol: /^https$/,
  hostname: z.regexes.domain,
  error: 'Enter a full https:// link.',
});

/** Site-relative path (`/spaces`) or https URL. */
export const Href = z.union([
  z.string().regex(/^\/(?!\/)[^\s]*$/, { error: 'Use a path like /spaces or an https:// link.' }),
  HttpsUrl,
]);

/**
 * Bangladesh phone number as printed on the site, e.g. `+88 09666-731731` or `01700-766084`.
 * Separators (space, hyphen) are allowed; the digits must be a 9–11 digit national
 * number starting with 0, optionally prefixed by the 88 country code.
 */
export const BdPhone = z
  .string()
  .refine((v) => /^(?:\+?88)?0\d{8,10}$/.test(v.replace(/[\s-]/g, '')), {
    error: 'Enter a Bangladesh number, e.g. +88 01700-766084.',
  });

/** Trimmed, non-empty text with a length range. */
export function text(min: number, max: number, label = 'This field') {
  return z
    .string()
    .trim()
    .min(min, {
      error: min <= 1 ? `${label} is required.` : `${label} needs at least ${min} characters.`,
    })
    .max(max, { error: `${label} must be ${max} characters or fewer.` });
}

/**
 * Optional form field: `''` (an untouched input) and `undefined` both mean "not provided".
 */
export function optionalField<T extends z.ZodType>(schema: T) {
  return z
    .union([z.literal(''), schema])
    .optional()
    .transform((v) => (v === '' ? undefined : (v as z.output<T> | undefined)));
}

/** Kebab-case identifier, e.g. `hot-desk-hour`. */
export const Slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: 'Use lowercase-kebab-case.' });
