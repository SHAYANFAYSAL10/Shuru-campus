import { AmenitiesSection } from '@/components/home/amenities-section';
import { CtaBand } from '@/components/home/cta-band';
import { DaySection } from '@/components/home/day-section';
import { HomeHero } from '@/components/home/home-hero';
import { Manifesto } from '@/components/home/manifesto';
import { PlanFinderSection } from '@/components/home/plan-finder-section';
import { SpacesSection } from '@/components/home/spaces-section';
import { VisitSection } from '@/components/home/visit-section';
import { WhyCoworking } from '@/components/home/why-coworking';
import { JsonLd } from '@/components/seo/json-ld';
import { getAmenities, getBrand, getPlans, getSiteSettings } from '@/lib/api';
import { localBusinessJsonLd } from '@/lib/local-business';
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
 * Home (docs/05-pages-and-interactions.md). Sections arrive in T5.1–T5.3 and M6; the numbered
 * eyebrows (B2: "01 — Spaces") count from Spaces, in page order. The closing CTA band isn't
 * numbered.
 */
export default async function HomePage() {
  const [site, plans, amenities] = await Promise.all([
    getSiteSettings(),
    getPlans(),
    getAmenities(),
  ]);

  const planList = plans.ok ? plans.data : [];
  const amenityList = amenities.ok ? amenities.data : [];
  // The plan finder and amenities step aside when there's nothing to show, so the numbers after
  // them close up. (Spaces stays, saying why it's empty.)
  const finder = planList.length > 0 ? 2 : undefined;
  const amenitiesAt = (finder ?? 1) + 1;
  const day = amenityList.length > 0 ? amenitiesAt + 1 : amenitiesAt;
  const why = day + 1;
  const numbers = { spaces: 1, finder, amenities: amenitiesAt, day, why, visit: why + 1 };

  return (
    <>
      <JsonLd data={localBusinessJsonLd(site)} />
      <HomeHero hours={site.hours} plans={plans.ok ? plans.data : null} />
      <Manifesto pillars={site.brand.pillars} />
      <SpacesSection plans={plans.ok ? plans.data : null} number={numbers.spaces} />
      {numbers.finder ? <PlanFinderSection plans={planList} number={numbers.finder} /> : null}
      <AmenitiesSection amenities={amenityList} number={numbers.amenities} />
      <DaySection shortName={site.brand.shortName} hours={site.hours} number={numbers.day} />
      <WhyCoworking number={numbers.why} />
      <VisitSection contact={site.contact} hours={site.hours} number={numbers.visit} />
      <CtaBand phones={site.contact.phones} inquiryForm={site.features.inquiryForm} />
    </>
  );
}
