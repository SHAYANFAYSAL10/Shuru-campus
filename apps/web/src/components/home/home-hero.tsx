import { Clock, Tag } from 'lucide-react';
import NextLink from 'next/link';

import { formatBdt, rateUnitLabel, type OpeningHours, type Plan } from '@campus/contracts';

import { HeroHeadline } from '@/components/home/hero-headline';
import { HeroImage } from '@/components/home/hero-image';
import { buttonClasses } from '@/components/ui/button-classes';
import { OpenStatus } from '@/components/ui/open-status';
import { hoursSummary } from '@/lib/hours-summary';
import { BOOK_VISIT_HREF } from '@/lib/navigation';
import { cheapestRate } from '@/lib/plans';

import type { ReactNode } from 'react';

const ICON = 'size-4 shrink-0 text-fg-subtle';

function Fact({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2">
      {icon}
      {children}
    </li>
  );
}

export interface HomeHeroProps {
  hours: OpeningHours;
  /** `null` when plans couldn't be loaded: the starting price is left out, never guessed. */
  plans: readonly Plan[] | null;
}

/**
 * Home #1 (docs/05-pages-and-interactions.md): the headline, where we are, the two ways in, and
 * the facts that matter first (open now, the starting price, the hours), then the photo.
 * A Server Component; only the open status hydrates.
 */
export function HomeHero({ hours, plans }: HomeHeroProps) {
  const from = plans ? cheapestRate(plans, 'hour') : undefined;
  const openDays = hoursSummary(hours).filter((row) => row.time !== null);

  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto max-w-content pt-8 px-page-safe pb-section sm:pt-12 lg:pt-16"
    >
      <HeroHeadline id="hero-title" />

      <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:items-end lg:gap-gutter">
        <div className="lg:col-span-7">
          <p className="max-w-xl type-lead text-fg-muted">
            Shared workspace &amp; beyond, in the heart of Gulshan.
          </p>
          {/* Full-width, thumb-sized buttons on phones; side by side from `sm`. */}
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <NextLink href="/spaces" className={buttonClasses({ size: 'lg' })}>
              Find your space
            </NextLink>
            <NextLink
              href={BOOK_VISIT_HREF}
              className={buttonClasses({ variant: 'secondary', size: 'lg' })}
            >
              Book a visit
            </NextLink>
          </div>
        </div>

        <ul
          aria-label="At a glance"
          className="flex flex-wrap gap-x-6 gap-y-3 text-small text-fg-muted lg:col-span-4 lg:col-start-9 lg:flex-col lg:justify-self-end"
        >
          <li className="inline-flex">
            <OpenStatus hours={hours} />
          </li>
          {from ? (
            <Fact icon={<Tag aria-hidden="true" className={ICON} strokeWidth={1.5} />}>
              <span aria-hidden="true">
                From{' '}
                <span className="text-fg lining-nums tabular-nums">
                  <span className="currency-symbol">৳</span>
                  {formatBdt(from.amountBdt).replace('৳', '')}
                </span>
                /{rateUnitLabel(from, 'short')}
              </span>
              <span className="sr-only">
                From {formatBdt(from.amountBdt).replace('৳', '')} taka per {rateUnitLabel(from)}
              </span>
            </Fact>
          ) : null}
          {openDays.map((row) => (
            <Fact
              key={row.days}
              icon={<Clock aria-hidden="true" className={ICON} strokeWidth={1.5} />}
            >
              <span aria-hidden="true">
                {row.days} <span className="tabular-nums">{row.time}</span>
              </span>
              <span className="sr-only">
                Open {row.daysLong}, {row.time}
              </span>
            </Fact>
          ))}
        </ul>
      </div>

      <HeroImage className="mt-12 lg:mt-16" />
    </section>
  );
}
