import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { plansSeed, type Plan } from '@campus/contracts';

import { PeriodFilter } from '@/components/spaces/period-filter';
import { PeriodScope } from '@/components/spaces/period-scope';
import { PlanLeadPrice } from '@/components/spaces/plan-lead-price';

function seedPlan(slug: Plan['slug']): Plan {
  const plan = plansSeed.find((p) => p.slug === slug);
  if (!plan) throw new Error(`seed has no ${slug}`);
  return plan;
}

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('PlanLeadPrice', () => {
  it('leads with the lowest rate, as "From", outside the Spaces filter', () => {
    render(<PlanLeadPrice rates={seedPlan('hot-desk').rates} />);
    expect(screen.getByRole('paragraph')).toHaveTextContent('From');
    expect(screen.getByText('100 taka per hour')).toBeInTheDocument();
  });

  it('follows the period chosen in the filter, rolling the digits', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PeriodScope initialPeriod="weekly">
        <PeriodFilter action="/spaces#pricing" />
        <PlanLeadPrice rates={seedPlan('executive-seating').rates} />
      </PeriodScope>,
    );

    // One weekly rate, so no "From".
    expect(screen.getByText('4,000 taka per week')).toBeInTheDocument();
    expect(screen.queryByText('From')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Monthly' }));

    // Two monthly rates: the lowest, as "From".
    expect(await screen.findByText('From')).toBeInTheDocument();
    expect(screen.getByText('14,000 taka per month')).toBeInTheDocument();
    expect(container.querySelector('[data-odometer]')).toHaveAttribute('data-rolled');
  });

  it('keeps its usual price for a period it is not booked by (the filter hides it)', () => {
    render(
      <PeriodScope initialPeriod="monthly">
        <PlanLeadPrice rates={seedPlan('hot-desk').rates} />
      </PeriodScope>,
    );
    expect(screen.getByText('100 taka per hour')).toBeInTheDocument();
  });
});
