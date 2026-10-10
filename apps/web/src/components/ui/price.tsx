import { formatBdt, type Rate, rateUnitLabel } from '@campus/contracts';

import { Odometer } from '@/components/motion/odometer';
import { cn } from '@/lib/cn';

export interface PriceProps {
  /** Whole taka. */
  amount: number;
  /** Adds "/month", "/4 hours" etc. Omit for a bare amount. */
  rate?: Pick<Rate, 'unit' | 'blockHours'>;
  size?: 'sm' | 'md' | 'lg';
  /** Rolls the digits to a new amount (the odometer) instead of swapping them. */
  roll?: boolean;
  className?: string;
}

const SIZE = {
  sm: 'text-body',
  md: 'text-h3 font-medium',
  lg: 'text-h2 font-medium tracking-tight',
} as const;

/**
 * A BDT price in Geist with tabular, lining figures (B2): the ৳ at 0.75em in fg-muted and the
 * unit in small fg-muted text. Screen readers hear "10,000 taka per month".
 */
export function Price({ amount, rate, size = 'md', roll = false, className }: PriceProps) {
  const figure = formatBdt(amount).replace('৳', '');
  const unit = rate ? rateUnitLabel(rate) : undefined;

  return (
    <span
      className={cn('inline-flex items-baseline font-sans lining-nums tabular-nums', className)}
    >
      <span aria-hidden="true" className={SIZE[size]}>
        <span className="currency-symbol">৳</span>
        {roll ? <Odometer text={figure} /> : figure}
      </span>
      {unit ? (
        <span aria-hidden="true" className="ml-1 text-small text-fg-muted">
          /{unit}
        </span>
      ) : null}
      <span className="sr-only">
        {figure} taka{unit ? ` per ${unit}` : ''}
      </span>
    </span>
  );
}
