import { Check } from 'lucide-react';
import NextLink from 'next/link';

import { type Plan } from '@campus/contracts';

import { buttonClasses } from '@/components/ui/button-classes';
import { Price } from '@/components/ui/price';
import { cn } from '@/lib/cn';
import { ratePeriod } from '@/lib/periods';
import { bookHref, rateTitle } from '@/lib/plans';

export interface RateListProps {
  plan: Plan;
  /** The id of the heading that names the list. */
  labelledBy: string;
  className?: string;
}

/**
 * A plan's rates, each with its own "Book this" into the inquiry form (`/contact?plan=…&rate=…`).
 * Rates paid by the period chosen in the filter are highlighted and ticked (`styles/spaces.css`).
 * The fill bleeds past the column edge so the text stays on it (B1); on phones it runs to the
 * screen edges as a band.
 */
export function RateList({ plan, labelledBy, className }: RateListProps) {
  return (
    <ul aria-labelledby={labelledBy} className={cn('flex flex-col sm:-mx-4', className)}>
      {plan.rates.map((rate) => {
        const { title, note } = rateTitle(rate);
        return (
          <li
            key={rate.id}
            data-rate-period={ratePeriod(rate)}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 py-3 transition-colors duration-fast ease-out max-sm:bleed-page-x sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:rounded-md sm:px-4"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium text-fg">
                <Check
                  data-rate-mark=""
                  aria-hidden="true"
                  className="size-4 shrink-0 text-fg"
                  strokeWidth={1.5}
                />
                {title}
              </p>
              {note ? <p className="text-small text-fg-muted">{note}</p> : null}
            </div>
            <Price amount={rate.amountBdt} rate={rate} size="md" className="justify-self-end" />
            <NextLink
              href={bookHref(plan.slug, rate.id)}
              // Starts with the visible text (WCAG 2.5.3), then says which plan and rate.
              aria-label={[`Book this: ${plan.name}`, title, note].filter(Boolean).join(', ')}
              className={cn(
                buttonClasses({ variant: 'secondary', size: 'sm' }),
                'col-span-2 justify-self-start sm:col-span-1',
              )}
            >
              Book this
            </NextLink>
          </li>
        );
      })}
    </ul>
  );
}
