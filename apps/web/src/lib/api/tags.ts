/** Data-cache tags for public content. Phase 2 admin saves call `revalidateTag` with these. */
export const CACHE_TAGS = {
  site: 'site',
  plans: 'plans',
  plan: (slug: string) => `plan:${slug}`,
  amenities: 'amenities',
  gallery: 'gallery',
} as const;
