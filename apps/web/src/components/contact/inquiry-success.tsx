'use client';

import { CircleCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { type Contact } from '@campus/contracts';

import { buttonClasses } from '@/components/ui/button-classes';
import { cn } from '@/lib/cn';
import { telHref } from '@/lib/contact';
import { useHydrated } from '@/lib/hooks/use-hydrated';
import {
  formatPreferredDate,
  interestLabel,
  type InquiryReceipt,
  type InterestGroup,
} from '@/lib/inquiry-form';

export interface InquirySuccessProps {
  receipt: InquiryReceipt;
  groups: readonly InterestGroup[];
  contact: Pick<Contact, 'phones'>;
  /** Back to an empty form. Without JS, the link reloads the page instead. */
  onReset: () => void;
  /** Focus the heading on mount (after a send with JS; a fresh page load focuses it itself). */
  focusOnMount?: boolean;
}

/** Where "Send another inquiry" leads without JS: the contact page, fresh. */
const CONTACT_HREF = '/contact';

/**
 * What the form becomes once an inquiry is in (B6 → Success, confirmed in place): thanks by
 * name, when we'll reply and where, what they asked about, and a number for anything sooner.
 */
export function InquirySuccess({
  receipt,
  groups,
  contact,
  onReset,
  focusOnMount = false,
}: InquirySuccessProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hydrated = useHydrated();
  const interest = receipt.interest ? interestLabel(groups, receipt.interest) : undefined;
  const phone = contact.phones[0];

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  const details = [
    interest ? { term: 'Space', value: interest } : null,
    receipt.preferredDate
      ? { term: 'Preferred start', value: formatPreferredDate(receipt.preferredDate) }
      : null,
    receipt.teamSize
      ? {
          term: 'Team size',
          value: `${String(receipt.teamSize)} ${receipt.teamSize === 1 ? 'person' : 'people'}`,
        }
      : null,
  ].filter((detail) => detail !== null);

  return (
    <div className="flex flex-col items-start gap-6">
      <span className="grid size-12 place-items-center rounded-full bg-bg-alt text-success">
        <CircleCheck aria-hidden="true" className="size-6" strokeWidth={1.5} />
      </span>

      <div className="flex flex-col gap-3">
        <h2
          ref={headingRef}
          tabIndex={-1}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- the no-JS path: announce the result
          autoFocus={!hydrated}
          className="type-h3 text-balance text-fg"
        >
          Thanks, {receipt.name}.
        </h2>
        <p className="type-lead text-pretty text-fg-muted">
          We’ll reply within one business day, to{' '}
          <span className="[overflow-wrap:anywhere] text-fg">{receipt.email}</span>.
        </p>
      </div>

      {details.length > 0 ? (
        <dl className="grid w-full items-baseline gap-x-6 gap-y-3 border-t border-border pt-6 sm:grid-cols-[auto_minmax(0,1fr)]">
          {details.map(({ term, value }) => (
            <div key={term} className="contents">
              <dt className="text-small text-fg-muted">{term}</dt>
              <dd className="text-fg tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {phone ? (
        <p className="text-fg-muted">
          Need us sooner? Call{' '}
          <a
            href={telHref(phone)}
            className="inline-flex min-h-hit items-center rounded-sm text-accent-text tabular-nums underline decoration-1 underline-offset-3 hover:decoration-2"
          >
            {phone}
          </a>
          .
        </p>
      ) : null}

      <a
        href={CONTACT_HREF}
        onClick={(event) => {
          event.preventDefault();
          onReset();
        }}
        className={cn(buttonClasses({ variant: 'secondary' }), 'w-full sm:w-auto')}
      >
        Send another inquiry
      </a>
    </div>
  );
}
