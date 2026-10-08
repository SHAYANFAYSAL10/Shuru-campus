import { z } from 'zod';

import { PlanSlug } from './plan';
import { Email, optionalField, Slug, text } from './primitives';
import { addYearsIso, dhakaToday } from '../domain/dhaka-time';

/** Phone as a visitor might type it (any country): digits, `+`, `-`, spaces. */
export const InquiryPhone = z
  .string()
  .trim()
  .min(6, { error: 'Phone number looks too short.' })
  .max(20, { error: 'Phone number looks too long.' })
  .regex(/^[\d+\-\s]+$/, { error: 'Use digits, spaces, + or - only.' });

/** ISO date from today (Dhaka) to one year ahead, inclusive. Evaluated at parse time. */
export const PreferredDate = z.iso
  .date({ error: 'Pick a valid date.' })
  .refine((d) => d >= dhakaToday(), { error: 'Pick today or a later date.' })
  .refine((d) => d <= addYearsIso(dhakaToday(), 1), {
    error: 'Pick a date within the next year.',
  });

export const InquiryCreate = z.object({
  name: text(2, 80, 'Name'),
  email: Email,
  phone: optionalField(InquiryPhone),
  planSlug: optionalField(PlanSlug),
  rateId: optionalField(Slug),
  teamSize: optionalField(
    z.coerce
      .number<string | number>()
      .int({ error: 'Use a whole number.' })
      .min(1, { error: 'At least 1 person.' })
      .max(100, { error: 'For more than 100 people, tell us in the message.' }),
  ),
  preferredDate: optionalField(PreferredDate),
  message: text(10, 2000, 'Message'),
  /**
   * Honeypot. Humans never see or fill it. A filled value is still *accepted* (202) so bots
   * aren't tipped off; the API then drops the inquiry (see `isHoneypotTripped`).
   */
  website: z.string().max(500).optional(),
});
export type InquiryCreateInput = z.input<typeof InquiryCreate>;
export type InquiryCreate = z.output<typeof InquiryCreate>;

export function isHoneypotTripped(inquiry: Pick<InquiryCreate, 'website'>): boolean {
  return (inquiry.website ?? '').trim().length > 0;
}

/** `202` body of `POST /inquiries`. */
export const InquiryAccepted = z.object({
  id: z.string().min(1),
  receivedAt: z.iso.datetime(),
});
export type InquiryAccepted = z.infer<typeof InquiryAccepted>;
