import { addYearsIso, dhakaToday } from '@campus/contracts';

import { sendInquiry } from '@/app/(site)/contact/actions';
import { InquiryCard } from '@/components/contact/inquiry-card';
import { InquiryPaused } from '@/components/contact/inquiry-paused';
import { ContactDetails } from '@/components/sections/contact-details';
import { MapCard } from '@/components/sections/map-card';
import { JsonLd } from '@/components/seo/json-ld';
import { getBrand, getPlans, getSiteSettings } from '@/lib/api';
import { EMPTY_FORM_VALUES, initialInterest, interestGroups } from '@/lib/inquiry-form';
import { localBusinessJsonLd } from '@/lib/local-business';
import { pageMetadata } from '@/lib/metadata';

import type { Metadata } from 'next';

const ASIDE_TITLE_ID = 'reach-title';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return pageMetadata(brand, {
    title: 'Contact',
    description:
      'Ask about a desk, a private office or a meeting room in Gulshan, Dhaka. Send an inquiry and we’ll reply within one business day, or call, email or drop by.',
    path: '/contact',
  });
}

/** The first value of a query parameter (`?plan=a&plan=b` reads as `a`). */
function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Contact (docs/05-pages-and-interactions.md → Contact): the inquiry form, pre-filled from
 * "Book this" (`?plan=…&rate=…`), beside every other way to reach us. With
 * `features.inquiryForm` off, the form gives way to a call or an email.
 */
export default async function ContactPage({ searchParams }: PageProps<'/contact'>) {
  const [site, plans, query] = await Promise.all([getSiteSettings(), getPlans(), searchParams]);
  const planList = plans.ok ? plans.data : [];
  const today = dhakaToday();

  return (
    <>
      <JsonLd data={localBusinessJsonLd(site)} />
      <div className="mx-auto max-w-content pt-8 px-page-safe pb-section sm:pt-12 lg:pt-16">
        <header className="max-w-3xl">
          <p className="type-eyebrow text-fg-subtle">Contact</p>
          {/* 20ch: the display measure (B1). */}
          <h1 className="mt-4 max-w-[20ch] type-h1 text-balance text-fg">
            Tell us how you <em>work</em>.
          </h1>
          <p className="mt-4 max-w-xl type-lead text-pretty text-fg-muted">
            A desk for the week, an office for the team, a room for an afternoon: tell us what you
            need and we’ll suggest the right space.
          </p>
        </header>

        <div className="mt-10 grid gap-section lg:mt-14 lg:grid-cols-12 lg:gap-gutter">
          <div className="lg:col-span-7">
            {site.features.inquiryForm ? (
              <InquiryCard
                action={sendInquiry}
                initialValues={{
                  ...EMPTY_FORM_VALUES,
                  interest: initialInterest(
                    planList,
                    firstParam(query.plan),
                    firstParam(query.rate),
                  ),
                }}
                groups={interestGroups(planList)}
                dateRange={{ min: today, max: addYearsIso(today, 1) }}
                contact={site.contact}
              />
            ) : (
              <InquiryPaused contact={site.contact} />
            )}
          </div>

          <aside aria-labelledby={ASIDE_TITLE_ID} className="flex flex-col gap-10 lg:col-span-5">
            <div className="flex flex-col gap-4">
              <h2 id={ASIDE_TITLE_ID} className="type-h3 text-fg">
                Rather <em>talk</em>?
              </h2>
              <p className="text-fg-muted">
                Call or email us, or come for a look around before you choose.
              </p>
            </div>
            <MapCard href={site.contact.mapUrl} />
            <ContactDetails contact={site.contact} hours={site.hours} />
          </aside>
        </div>
      </div>
    </>
  );
}
