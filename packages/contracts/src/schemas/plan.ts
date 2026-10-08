import { z } from 'zod';

import { Slug, text } from './primitives';

export const PLAN_SLUGS = [
  'hot-desk',
  'business-seating',
  'executive-seating',
  'private-office',
  'meeting-room',
  'seminar-room',
] as const;
export const PlanSlug = z.enum(PLAN_SLUGS);
export type PlanSlug = z.infer<typeof PlanSlug>;

export const RateUnit = z.enum(['hour', 'day', 'week', 'month', 'block']);
export type RateUnit = z.infer<typeof RateUnit>;

export const Rate = z
  .object({
    id: Slug,
    /** e.g. "Premium", "Big room". */
    label: text(1, 40, 'Rate label').optional(),
    /** Whole BDT. Never a float. */
    amountBdt: z
      .int({ error: 'Use a whole number of taka.' })
      .positive({ error: 'Price must be above zero.' }),
    unit: RateUnit,
    /** Hours covered by one `block` rate (e.g. 4). */
    blockHours: z.int().positive().max(24).optional(),
    /** People the rate covers (rooms, offices). */
    capacity: z.int().positive().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.unit === 'block' && value.blockHours === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['blockHours'],
        message: 'Block rates need a number of hours.',
      });
    }
    if (value.unit !== 'block' && value.blockHours !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['blockHours'],
        message: 'Only block rates have block hours.',
      });
    }
  });
export type Rate = z.infer<typeof Rate>;

export const PlanFeature = z.object({
  title: text(1, 80, 'Feature'),
  detail: text(1, 200, 'Feature detail').optional(),
});
export type PlanFeature = z.infer<typeof PlanFeature>;

export const Plan = z.object({
  slug: PlanSlug,
  name: text(1, 60, 'Plan name'),
  summary: text(1, 240, 'Summary'),
  audience: z.array(text(1, 60, 'Audience')).min(1, { error: 'Add at least one audience.' }),
  rates: z
    .array(Rate)
    .min(1, { error: 'Add at least one rate.' })
    .refine((rates) => new Set(rates.map((r) => r.id)).size === rates.length, {
      error: 'Rate IDs must be unique within a plan.',
    }),
  features: z.array(PlanFeature).max(20),
  imageId: z.string().min(1),
  highlight: z.boolean(),
  order: z.int().nonnegative(),
});
export type Plan = z.infer<typeof Plan>;

/** A full plan list: slugs must be unique. */
export const PlanList = z
  .array(Plan)
  .refine((plans) => new Set(plans.map((p) => p.slug)).size === plans.length, {
    error: 'Plan slugs must be unique.',
  });
