import { Mail, Phone } from 'lucide-react';

import { type Contact, type OpeningHours } from '@campus/contracts';

import { HoursTable } from '@/components/home/hours-table';
import { MapCard } from '@/components/home/map-card';
import { SectionHeading } from '@/components/sections/section-heading';
import { CopyButton } from '@/components/ui/copy-button';
import { OpenStatus } from '@/components/ui/open-status';
import { telHref } from '@/lib/contact';

import type { ReactNode } from 'react';

export interface VisitSectionProps {
  contact: Contact;
  hours: OpeningHours;
  /** Position on Home, for the eyebrow. */
  number?: number;
}

const TITLE_ID = 'visit-title';
const ICON = 'size-4 shrink-0 text-fg-subtle';
const LINK =
  'inline-flex min-h-hit min-w-0 items-center gap-3 rounded-sm text-fg transition-colors hover:text-accent-text';

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="type-eyebrow text-fg-muted">{title}</h3>
      {children}
    </div>
  );
}

/**
 * Home #9 (docs/05-pages-and-interactions.md): where we are, when we're open and how to reach
 * us. The map card leads (it's the one link to directions), then the address, the week's hours
 * with today marked, and click-to-call and copy-email (with a toast). A Server Component; the
 * open status, hours table and copy button hydrate.
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

          {/*
            Narrow: everything stacked. From @md, address and contact share a row (contact as
            wide as the email, so it never breaks mid-word). From @2xl (tablets), they stack
            beside the hours, which would otherwise stretch across the page.
          */}
          <div className="@container lg:col-span-5">
            <div className="grid gap-10 @2xl:grid-cols-2 @2xl:gap-x-gutter">
              <div className="grid content-start gap-10 @md:grid-cols-[minmax(0,1fr)_auto] @md:gap-x-gutter @2xl:grid-cols-1">
                <Group title="Address">
                  <address className="flex flex-col text-fg not-italic">
                    {contact.addressLines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </address>
                </Group>

                <Group title="Call or email">
                  <ul className="-my-3 flex flex-col">
                    {contact.phones.map((phone) => (
                      <li key={phone}>
                        <a href={telHref(phone)} className={`${LINK} tabular-nums`}>
                          <Phone aria-hidden="true" className={ICON} strokeWidth={1.5} />
                          {phone}
                        </a>
                      </li>
                    ))}
                    <li className="flex min-w-0 items-center gap-1">
                      <a href={`mailto:${contact.email}`} className={LINK}>
                        <Mail aria-hidden="true" className={ICON} strokeWidth={1.5} />
                        <span className="min-w-0 [overflow-wrap:anywhere]">{contact.email}</span>
                      </a>
                      <CopyButton
                        value={contact.email}
                        label="Copy email address"
                        copiedMessage="Email address copied"
                      />
                    </li>
                  </ul>
                </Group>
              </div>

              <Group title="Opening hours">
                <OpenStatus hours={hours} />
                <HoursTable hours={hours} />
                <p className="text-small text-fg-muted">Dhaka time</p>
              </Group>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
