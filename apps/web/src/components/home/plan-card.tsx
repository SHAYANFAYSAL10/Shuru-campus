import { Check } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';

import { type Plan } from '@campus/contracts';

import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/ui/price';
import { cn } from '@/lib/cn';
import { planPhoto } from '@/lib/plan-media';
import { keyFeatures, planFromRate, planHref } from '@/lib/plans';

// One card per carousel slot below `md`, two columns from `md`, three from `lg`.
const SIZES = '(min-width: 64rem) 30vw, (min-width: 48rem) 45vw, 80vw';

export interface PlanCardProps {
  plan: Plan;
  /** `li` inside a plan list (the list's grid then lays out the card directly), else `article`. */
  as?: 'article' | 'li';
  /** Heading level inside the page outline. */
  headingLevel?: 'h3' | 'h4';
  className?: string;
}

/**
 * A plan at a glance (05 → Home #3): photo (B4: 4:5), name, who it's for, the "from" price and
 * three key features. It spans five rows of its list's grid and lays its parts on them as a
 * subgrid, so render it `as="li"` straight in the list (a nested subgrid mis-sizes its rows in
 * Chromium). The whole card is one link to the plan (the name's link stretches over
 * it), so it's a single tab stop with a sensible name. Hover lifts the card and eases the photo
 * in (fine pointers only); T6.5 turns the click into a shared-element transition.
 */
export function PlanCard({
  plan,
  as: Root = 'article',
  headingLevel: Heading = 'h3',
  className,
}: PlanCardProps) {
  const photo = planPhoto(plan);
  const from = planFromRate(plan);

  return (
    <Root
      className={cn(
        // Five rows (photo, name, audience, price, features) on the list's subgrid, so names,
        // prices and feature lists line up across cards even when an audience wraps.
        'group relative row-span-5 grid snap-start grid-rows-subgrid content-start gap-y-0 rounded-md focus-ring-within',
        'transition-transform duration-base ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      <div className="relative aspect-4/5 overflow-hidden rounded-md bg-bg-alt">
        {photo ? (
          <Image
            src={photo.src}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            sizes={SIZES}
            className="size-full object-cover photo-tone transition-transform duration-slow ease-out group-hover:scale-103 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : null}
        {plan.highlight ? (
          <Badge tone="accent" className="absolute top-3 left-3">
            Popular
          </Badge>
        ) : null}
      </div>

      <Heading className="pt-5 type-h3 text-fg">
        {/* The stretched link: its ::after covers the card, so the photo and price click through. */}
        <NextLink
          href={planHref(plan.slug)}
          className="outline-none after:absolute after:inset-0 after:rounded-md"
        >
          {plan.name}
        </NextLink>
      </Heading>
      <p className="pt-2 text-small text-fg-muted">{plan.audience.join(', ')}</p>

      <p className="flex items-baseline gap-1.5 py-4 text-fg">
        <span className="text-small text-fg-muted">From</span>
        <Price amount={from.amountBdt} rate={from} size="sm" className="font-medium" />
      </p>

      <ul
        aria-label="Includes"
        className="flex flex-col gap-2 self-start border-t border-border pt-4"
      >
        {keyFeatures(plan).map((feature) => (
          <li key={feature.title} className="flex gap-2 text-small text-fg-muted">
            <Check
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-brand"
              strokeWidth={1.5}
            />
            <span>
              {feature.title}
              {feature.detail ? <span className="text-fg-subtle"> · {feature.detail}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </Root>
  );
}
