import { Mail, Phone } from 'lucide-react';

import { type Contact, type OpeningHours } from '@campus/contracts';

import { HoursTable } from '@/components/sections/hours-table';
import { CopyButton } from '@/components/ui/copy-button';
import { OpenStatus } from '@/components/ui/open-status';
import { cn } from '@/lib/cn';
import { telHref } from '@/lib/contact';

import type { ReactNode } from 'react';

export interface ContactDetailsProps {
  contact: Contact;
  hours: OpeningHours;
  className?: string;
}

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
 * Address, click-to-call and copy-email (with a toast), and the week's hours with today marked
 * and the live open status. Shared by Home → Visit us and the contact page's side panel. It sits
 * in a container query, so it fits any slot: stacked when narrow, address and contact side by
 * side from `@md` (contact as wide as the email, so it never breaks mid-word), then both stacked
 * beside the hours from `@2xl`, which would otherwise stretch across the slot.
 */
export function ContactDetails({ contact, hours, className }: ContactDetailsProps) {
  return (
    <div className={cn('@container', className)}>
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
  );
}
