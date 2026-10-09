import 'server-only';

import { z } from 'zod';

import {
  Amenity,
  collectionOf,
  GalleryImage,
  HealthResponse,
  Plan,
  PlanList,
  SiteSettings,
  type GalleryCategory,
  type PlanSlug,
} from '@campus/contracts';

import { apiFetch } from '@/lib/api/client';
import { PUBLIC_REVALIDATE_S } from '@/lib/api/config';
import { CACHE_TAGS } from '@/lib/api/tags';

const PlanCollection = z.object({ items: PlanList });
const AmenityCollection = collectionOf(Amenity);
const GalleryCollection = collectionOf(GalleryImage);

const cached = (...tags: string[]) => ({ tags, revalidate: PUBLIC_REVALIDATE_S });

export function getSite() {
  return apiFetch('/site', SiteSettings, { cache: cached(CACHE_TAGS.site) });
}

export async function getPlans() {
  const result = await apiFetch('/plans', PlanCollection, { cache: cached(CACHE_TAGS.plans) });
  return result.ok ? { ok: true as const, data: result.data.items } : result;
}

export function getPlan(slug: PlanSlug) {
  return apiFetch(`/plans/${encodeURIComponent(slug)}`, Plan, {
    cache: cached(CACHE_TAGS.plans, CACHE_TAGS.plan(slug)),
  });
}

export async function getAmenities() {
  const result = await apiFetch('/amenities', AmenityCollection, {
    cache: cached(CACHE_TAGS.amenities),
  });
  return result.ok ? { ok: true as const, data: result.data.items } : result;
}

export async function getGallery(category?: GalleryCategory) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const result = await apiFetch(`/gallery${query}`, GalleryCollection, {
    cache: cached(CACHE_TAGS.gallery),
  });
  return result.ok ? { ok: true as const, data: result.data.items } : result;
}

export function getHealth() {
  return apiFetch('/health', HealthResponse, { timeoutMs: 2000 });
}
