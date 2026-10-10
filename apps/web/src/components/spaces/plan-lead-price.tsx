'use client';

import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';

import { type Plan } from '@campus/contracts';

import { useScopedPeriod } from '@/components/spaces/period-scope';
import { Price } from '@/components/ui/price';
import { cn } from '@/lib/cn';
import { periodPrice } from '@/lib/periods';
import { ease, seconds } from '@/styles/motion';

export interface PlanLeadPriceProps {
  rates: Plan['rates'];
  className?: string;
}

/**
 * The price a plan leads with under its name: its lowest rate, or with a period chosen in the
 * Spaces filter, its lowest rate paid by that period ("From ৳100/hour" → "৳650/day"). The digits
 * roll when the period changes (the odometer, 04 §6), "From" fades in or out, and the price
 * glides into its place (`layout`, transform only). Screen readers get the new prices from the
 * filter's summary line, not from here, so a change isn't announced once per plan.
 */
export function PlanLeadPrice({ rates, className }: PlanLeadPriceProps) {
  const period = useScopedPeriod();
  // A plan the period doesn't fit is hidden by the filter; keep it showing its usual price.
  const price = periodPrice({ rates }, period) ?? periodPrice({ rates }, undefined);
  if (!price) return null;

  const transition = { duration: seconds('base'), ease: ease.out };

  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2 text-fg', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {price.isFrom ? (
          <m.span
            key="from"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: seconds('fast'), ease: ease.in } }}
            transition={transition}
            className="text-small text-fg-muted"
          >
            From
          </m.span>
        ) : null}
      </AnimatePresence>
      <m.span layout="position" transition={transition}>
        <Price amount={price.rate.amountBdt} rate={price.rate} size="md" roll />
      </m.span>
    </p>
  );
}
