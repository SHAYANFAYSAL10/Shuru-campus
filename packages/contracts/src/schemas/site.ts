import { z } from 'zod';

import { Brand } from './brand';
import { BdPhone, Email, Href, HttpsUrl, text, TimeOfDay, toMinutes } from './primitives';

export const Weekday = z.int().min(0).max(6);

/** One weekday: both times set (open) or both null (closed). */
export const DayHours = z
  .object({
    /** 0 = Sunday … 6 = Saturday. */
    day: Weekday,
    open: TimeOfDay.nullable(),
    close: TimeOfDay.nullable(),
  })
  .superRefine((value, ctx) => {
    const { open, close } = value;
    if ((open === null) !== (close === null)) {
      ctx.addIssue({
        code: 'custom',
        path: [open === null ? 'open' : 'close'],
        message: 'Set both opening and closing times, or mark the day closed.',
      });
    } else if (open !== null && close !== null && toMinutes(close) <= toMinutes(open)) {
      ctx.addIssue({
        code: 'custom',
        path: ['close'],
        message: 'Closing time must be after opening time.',
      });
    }
  });
export type DayHours = z.infer<typeof DayHours>;

export const OpeningHours = z.object({
  timezone: z.literal('Asia/Dhaka'),
  weekly: z
    .array(DayHours)
    .length(7, { error: 'List all seven days.' })
    .refine((days) => new Set(days.map((d) => d.day)).size === 7, {
      error: 'Each weekday must appear exactly once.',
    }),
});
export type OpeningHours = z.infer<typeof OpeningHours>;

export const SocialPlatform = z.enum(['facebook', 'instagram', 'x']);
export type SocialPlatform = z.infer<typeof SocialPlatform>;

export const Contact = z.object({
  addressLines: z
    .array(text(1, 120, 'Address line'))
    .min(1)
    .max(4),
  phones: z.array(BdPhone).min(1, { error: 'Add at least one phone number.' }).max(5),
  email: Email,
  mapUrl: HttpsUrl,
});
export type Contact = z.infer<typeof Contact>;

export const Announcement = z
  .object({
    enabled: z.boolean(),
    text: z
      .string()
      .trim()
      .max(120, { error: 'Keep the announcement to 120 characters or fewer.' }),
    href: Href.optional(),
  })
  .refine((a) => !a.enabled || a.text.length > 0, {
    path: ['text'],
    error: 'Add the announcement text, or turn the banner off.',
  });
export type Announcement = z.infer<typeof Announcement>;

export const FeatureFlags = z.object({
  inquiryForm: z.boolean(),
  gallery: z.boolean(),
  maintenanceMode: z.boolean(),
});
export type FeatureFlags = z.infer<typeof FeatureFlags>;

export const SiteSettings = z.object({
  brand: Brand,
  contact: Contact,
  hours: OpeningHours,
  socials: z.array(z.object({ platform: SocialPlatform, url: HttpsUrl })).max(6),
  memberPortal: z.object({ loginUrl: HttpsUrl, signupUrl: HttpsUrl }),
  announcement: Announcement,
  features: FeatureFlags,
});
export type SiteSettings = z.infer<typeof SiteSettings>;
