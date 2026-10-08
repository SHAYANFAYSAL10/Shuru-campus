import { Check } from 'lucide-react';
import Image from 'next/image';

import { type Plan } from '@campus/contracts';

import { RateList } from '@/components/spaces/rate-list';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/cn';
import { listText, lowerFirst } from '@/lib/list-text';
import { planPeriods } from '@/lib/periods';
import { planPhoto } from '@/lib/plan-media';
import { bookHref, pricedBySize } from '@/lib/plans';

// Full width below `lg`, then 5 of 12 columns, capped with the content width.
const SIZES = '(min-width: 90rem) 560px, (min-width: 64rem) 40vw, 100vw';

export interface PlanSectionProps {
  plan: Plan;
  /** Position in the list: odd plans put the photo on the right from `lg` (B1 asymmetry). */
  index: number;
  /** Loads the photo eagerly (the first plan can be in the first viewport). */
  eager?: boolean;
}

/**
 * One plan on Spaces (05 → Spaces & Pricing), anchored at its slug (`/spaces#hot-desk`): photo,
 * name, who it's for, its rates with "Book this", and the full "Included" checklist. From `lg` a
 * 5/6 split that alternates sides down the page. It carries the periods it offers, so the period
 * filter can hide it (`styles/spaces.css`).
 */
export function PlanSection({ plan, index, eager = false }: PlanSectionProps) {
  const photo = planPhoto(plan);
  const titleId = `${plan.slug}-title`;
  const ratesId = `${plan.slug}-rates`;
  const flipped = index % 2 === 1;

  return (
    <section
      id={plan.slug}
      aria-labelledby={titleId}
      data-offers={planPeriods(plan).join(' ')}
      className="grid gap-8 border-t border-border py-12 lg:grid-cols-12 lg:gap-gutter lg:py-20"
    >
      <div
        className={cn(
          'lg:col-span-5 lg:row-start-1',
          flipped ? 'lg:col-start-8' : 'lg:col-start-1',
        )}
      >
        <div className="relative aspect-3/2 overflow-hidden rounded-lg bg-bg-alt lg:aspect-4/5">
          {photo ? (
            <Image
              src={photo.src}
              width={photo.width}
              height={photo.height}
              alt={photo.alt}
              sizes={SIZES}
              loading={eager ? 'eager' : 'lazy'}
              className="size-full object-cover photo-tone"
            />
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          'min-w-0 lg:col-span-6 lg:row-start-1 lg:self-center',
          flipped ? 'lg:col-start-1' : 'lg:col-start-7',
        )}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 id={titleId} className="type-h2 text-fg">
            {plan.name}
          </h2>
          {plan.highlight ? <Badge tone="accent">Popular</Badge> : null}
        </div>
        <p className="mt-3 text-fg-muted">For {listText(plan.audience.map(lowerFirst))}</p>
        <p className="mt-4 max-w-xl type-lead text-fg-muted">{plan.summary}</p>

        <h3 id={ratesId} className="mt-10 type-eyebrow text-fg-muted">
          Rates
        </h3>
        <RateList plan={plan} labelledBy={ratesId} className="mt-3" />
        {pricedBySize(plan) ? (
          <p className="mt-3 text-small text-fg-muted">
            Need a different size?{' '}
            <Link href={bookHref(plan.slug)} className="hit-target">
              Ask us
            </Link>
          </p>
        ) : null}

        <h3 className="mt-10 type-eyebrow text-fg-muted">Included</h3>
        <ul
          aria-label={`Included with ${plan.name}`}
          className="mt-4 grid gap-x-gutter gap-y-3 sm:grid-cols-2"
        >
          {plan.features.map((feature) => (
            <li key={feature.title} className="flex gap-2 text-fg">
              <Check
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-brand"
                strokeWidth={1.5}
              />
              <span>
                {feature.title}
                {feature.detail ? <span className="text-fg-muted"> · {feature.detail}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
