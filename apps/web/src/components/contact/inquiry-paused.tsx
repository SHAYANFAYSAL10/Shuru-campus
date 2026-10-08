import { Mail, Phone } from 'lucide-react';

import { type Contact } from '@campus/contracts';

import { buttonClasses } from '@/components/ui/button-classes';
import { cn } from '@/lib/cn';
import { telHref } from '@/lib/contact';

export interface InquiryPausedProps {
  contact: Pick<Contact, 'phones' | 'email'>;
}

const TITLE_ID = 'inquiry-paused-title';

/**
 * In the form's place while `features.inquiryForm` is off (admin → Features): no dead form, just
 * the two quickest ways to ask instead.
 */
export function InquiryPaused({ contact }: InquiryPausedProps) {
  const phone = contact.phones[0];
  return (
    <section
      aria-labelledby={TITLE_ID}
      className="flex flex-col items-start gap-6 rounded-lg border border-border bg-surface p-6 sm:p-8 lg:p-10"
    >
      <div className="flex flex-col gap-3">
        <h2 id={TITLE_ID} className="type-h3 text-fg">
          Call or email us
        </h2>
        <p className="max-w-xl text-pretty text-fg-muted">
          We’re not taking inquiries through the form right now. Call or email and we’ll help you
          find the right space.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {phone ? (
          <a
            href={telHref(phone)}
            className={cn(buttonClasses({ size: 'lg' }), 'w-full tabular-nums sm:w-auto')}
          >
            <Phone aria-hidden="true" className="size-5" strokeWidth={1.5} />
            Call {phone}
          </a>
        ) : null}
        <a
          href={`mailto:${contact.email}`}
          className={cn(buttonClasses({ variant: 'secondary', size: 'lg' }), 'w-full sm:w-auto')}
        >
          <Mail aria-hidden="true" className="size-5" strokeWidth={1.5} />
          Email us
        </a>
      </div>
    </section>
  );
}
