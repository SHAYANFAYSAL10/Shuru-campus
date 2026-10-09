import { type Contact, type OpeningHours } from '@campus/contracts';

import { ContactDetails } from '@/components/sections/contact-details';
import { MapCard } from '@/components/sections/map-card';
import { SectionHeading } from '@/components/sections/section-heading';

export interface VisitSectionProps {
  contact: Contact;
  hours: OpeningHours;
  /** Position on Home, for the eyebrow. */
  number?: number;
}

const TITLE_ID = 'visit-title';

/**
 * Home #9 (docs/05-pages-and-interactions.md): where we are, when we're open and how to reach
 * us. The map card leads (it's the one link to directions), then the address, the week's hours
 * with today marked, and click-to-call and copy-email (with a toast). A Server Component; the
 * details (`<ContactDetails>`, shared with Contact) hydrate their status, hours and copy button.
 */
export function VisitSection({ contact, hours, number }: VisitSectionProps) {
  return (
    <section aria-labelledby={TITLE_ID} className="bg-bg-alt">
      <div className="mx-auto max-w-content py-section px-page-safe">
        <SectionHeading
          id={TITLE_ID}
          number={number}
          eyebrow="Visit us"
          title={
            <>
              Come and <em>see</em> it for yourself.
            </>
          }
          lead="Come for a look around before you choose. Here’s where to find us, when we’re in and how to reach us."
        />

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-gutter">
          <MapCard href={contact.mapUrl} className="lg:col-span-7 lg:aspect-auto" />
          <ContactDetails contact={contact} hours={hours} className="lg:col-span-5" />
        </div>
      </div>
    </section>
  );
}
