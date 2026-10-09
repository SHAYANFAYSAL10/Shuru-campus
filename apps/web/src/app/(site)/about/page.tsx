import { AboutStory } from '@/components/about/about-story';
import { AudienceSection } from '@/components/about/audience-section';
import { NameMeaning } from '@/components/about/name-meaning';
import { PillarsSection } from '@/components/about/pillars-section';
import { CtaBand } from '@/components/home/cta-band';
import { WhyCoworking } from '@/components/home/why-coworking';
import { getBrand, getPlans, getSiteSettings } from '@/lib/api';
import { pageMetadata } from '@/lib/metadata';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return pageMetadata(brand, {
    title: 'About',
    description:
      'Who we are and why we run a co-working space in Gulshan, Dhaka: our story, what we stand for and who the space is for.',
    path: '/about',
  });
}

/**
 * About (docs/05-pages-and-interactions.md → About): the story, the meaning of the name (when the
 * brand has one), the pillars, the ideas behind co-working and who it's for, then the closing
 * ask. Sections alternate bg → lake → bg-alt → bg → bg-alt → bg (A5). If the plans fail to load,
 * only the audience tiles notice: they lead to Spaces without prices.
 */
export default async function AboutPage() {
  const [site, plans] = await Promise.all([getSiteSettings(), getPlans()]);
  const { brand } = site;

  return (
    <>
      <AboutStory shortName={brand.shortName} />
      <NameMeaning shortName={brand.shortName} nameMeaning={brand.nameMeaning} />
      <PillarsSection pillars={brand.pillars} subTagline={brand.subTagline} />
      <WhyCoworking />
      <AudienceSection plans={plans.ok ? plans.data : null} />
      <CtaBand phones={site.contact.phones} inquiryForm={site.features.inquiryForm} />
    </>
  );
}
