import { z } from 'zod';

import { PlanList } from './plan';
import { Announcement, FeatureFlags, SiteSettings } from './site';

export const AdminConfig = z.object({
  site: SiteSettings,
  plans: PlanList,
  meta: z.object({
    dataSource: z.literal('memory'),
    editable: z.literal(false),
    updatedAt: z.iso.datetime(),
  }),
});
export type AdminConfig = z.infer<typeof AdminConfig>;

/** Body of `PUT /admin/config/features`. */
export const FeaturesUpdate = FeatureFlags.extend({ announcement: Announcement });
export type FeaturesUpdate = z.infer<typeof FeaturesUpdate>;

/**
 * Result of an admin save. Phase 1 validates fully but never persists, so `persisted` is
 * always `false` (HTTP 202). Phase 2 keeps this shape and returns `true` (HTTP 200).
 */
export const PreviewSaveResult = z.object({
  persisted: z.boolean(),
  validated: z.literal(true),
  message: z.string(),
});
export type PreviewSaveResult = z.infer<typeof PreviewSaveResult>;
