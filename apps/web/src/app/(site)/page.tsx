import { HomeHero } from '@/components/home/home-hero';
import { Manifesto } from '@/components/home/manifesto';
import { getBrand, getPlans, getSiteSettings } from '@/lib/api';
import { pageMetadata, sentence } from '@/lib/metadata';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return pageMetadata(brand, {
    description: `Shared workspace & beyond, in the heart of Gulshan. ${sentence(brand.subTagline)}`,
    path: '/',
  });
}

/** Home (docs/05-pages-and-interactions.md → Home). Sections arrive in T5.1–T5.3 and M6. */
export default async function HomePage() {
  const [site, plans] = await Promise.all([getSiteSettings(), getPlans()]);

  return (
    <>
      <HomeHero hours={site.hours} plans={plans.ok ? plans.data : null} />
      <Manifesto pillars={site.brand.pillars} />
    </>
  );
}
