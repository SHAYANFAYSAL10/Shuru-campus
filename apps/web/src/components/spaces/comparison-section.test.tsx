import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { plansSeed } from '@campus/contracts';

import { ComparisonSection } from '@/components/spaces/comparison-section';
import { sortPlans } from '@/lib/plans';

const plans = sortPlans(plansSeed);

function row(table: HTMLElement, name: string): HTMLElement {
  const tr = within(table).getByRole('rowheader', { name }).closest('tr');
  if (!tr) throw new Error(`no ${name} row`);
  return tr;
}

describe('ComparisonSection', () => {
  it('says once what every plan includes', () => {
    render(<ComparisonSection plans={plans} />);
    expect(
      screen.getByText(
        'Every plan includes up to 40 Mbps internet and unlimited tea & coffee. Here’s how the rest compares.',
      ),
    ).toBeInTheDocument();
  });

  it('compares plans in a table with plan columns and feature rows', () => {
    render(<ComparisonSection plans={plans} />);
    const table = screen.getByRole('table', {
      name: 'Plans compared by price, billing and what’s included',
    });
    const headers = within(table).getAllByRole('columnheader');
    expect(headers.slice(1).map((h) => within(h).getByRole('link').textContent)).toEqual(
      plans.map((plan) => plan.name),
    );
    expect(row(table, 'Billing')).toHaveTextContent('Hourly and daily');
    expect(row(table, 'From')).toHaveTextContent('100 taka per hour');

    const storage = within(row(table, 'Storage')).getAllByRole('cell');
    expect(storage[0]).toHaveTextContent('Not included');
    expect(storage[2]).toHaveTextContent('CabinetComplimentary locker');
  });

  it('has a card per plan for narrow screens, listing only what it includes', () => {
    render(<ComparisonSection plans={plans} />);
    const cards = screen.getByRole('list', { name: 'Plans compared' });
    expect(within(cards).getAllByRole('heading', { level: 3 })).toHaveLength(plans.length);

    const hotDesk = within(cards).getByRole('heading', { name: 'Hot Desk' }).closest('li');
    if (!hotDesk) throw new Error('no card');
    expect(hotDesk).toHaveTextContent('Quiet spaces');
    expect(hotDesk).not.toHaveTextContent('Storage');
  });
});
