import { AmenitiesSection } from '@/components/home/amenities-section';
import { HomeHero } from '@/components/home/home-hero';
import { Manifesto } from '@/components/home/manifesto';
import { SpacesSection } from '@/components/home/spaces-section';
import { WhyCoworking } from '@/components/home/why-coworking';
import { getAmenities, getBrand, getPlans, getSiteSettings } from '@/lib/api';
import { pageMetadata, sentence } from '@/lib/metadata';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return pageMetadata(brand, {
    description: `Shared workspace & beyond, in the heart of Gulshan. ${sentence(brand.subTagline)}`,
    path: '/',
  });
}

/**
 * Home (docs/05-pages-and-interactions.md → Home). Sections arrive in T5.1–T5.3 and M6; the
 * numbered eyebrows (B2: "01 — Spaces") count from Spaces, in page order.
 */
export default async function HomePage() {
  const [site, plans, amenities] = await Promise.all([
    getSiteSettings(),
    getPlans(),
    getAmenities(),
  ]);

  const amenityList = amenities.ok ? amenities.data : [];
  // Amenities step aside when they fail to load, so the numbers after them close up.
  const numbers = { spaces: 1, amenities: 2, why: amenityList.length > 0 ? 3 : 2 };

  return (
    <>
      <HomeHero hours={site.hours} plans={plans.ok ? plans.data : null} />
      <Manifesto pillars={site.brand.pillars} />
      <SpacesSection plans={plans.ok ? plans.data : null} number={numbers.spaces} />
      <AmenitiesSection amenities={amenityList} number={numbers.amenities} />
      <WhyCoworking number={numbers.why} />
    </>
  );
}
