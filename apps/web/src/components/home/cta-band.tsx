import NextLink from 'next/link';

import { Magnetic } from '@/components/motion/magnetic';
import { buttonClasses } from '@/components/ui/button-classes';
import { cn } from '@/lib/cn';
import { telHref } from '@/lib/contact';

export interface CtaBandProps {
  /** The first is offered as the alternative (or the only way in, without the form). */
  phones: readonly string[];
  /** `features.inquiryForm`: when off, the band asks for a call instead. */
  inquiryForm: boolean;
}

const TITLE_ID = 'cta-title';
const INQUIRY_HREF = '/contact';

/**
 * Home #10 (docs/05-pages-and-interactions.md): the page's last ask, centered (B1), with one
 * magnetic primary button (signature moment 7) and a phone number for people who'd rather talk.
 * The heading avoids "begin", which the footer's sign-off says right below (B5: once per screen).
 */
export function CtaBand({ phones, inquiryForm }: CtaBandProps) {
  const phone = phones[0];

  return (
    <section aria-labelledby={TITLE_ID}>
      <div className="mx-auto flex max-w-content flex-col items-center py-section px-page-safe text-center">
        {/* 20ch: the display measure (B1). */}
        <h2 id={TITLE_ID} className="max-w-[20ch] type-h1 text-balance text-fg">
          Ready when <em>you</em> are.
        </h2>
        <p className="mt-4 max-w-xl type-lead text-pretty text-fg-muted">
          {inquiryForm
            ? 'Tell us how you work and we’ll suggest the right space. We reply within one business day.'
            : 'Tell us how you work and we’ll suggest the right space.'}
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-4">
          {inquiryForm ? (
            <Magnetic className="w-full sm:w-auto">
              <NextLink href={INQUIRY_HREF} className={cn(buttonClasses({ size: 'lg' }), 'w-full')}>
                Send an inquiry
              </NextLink>
            </Magnetic>
          ) : phone ? (
            <Magnetic className="w-full sm:w-auto">
              <a
                href={telHref(phone)}
                className={cn(buttonClasses({ size: 'lg' }), 'w-full tabular-nums')}
              >
                Call {phone}
              </a>
            </Magnetic>
          ) : null}

          {inquiryForm && phone ? (
            <p className="text-fg-muted">
              Or call{' '}
              <a
                href={telHref(phone)}
                className="inline-flex min-h-hit items-center rounded-sm text-accent-text tabular-nums underline decoration-1 underline-offset-3 hover:decoration-2"
              >
                {phone}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
