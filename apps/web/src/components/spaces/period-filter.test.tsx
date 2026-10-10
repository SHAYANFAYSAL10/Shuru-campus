import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { PeriodFilter } from '@/components/spaces/period-filter';
import { PeriodScope } from '@/components/spaces/period-scope';
import { PeriodSummary } from '@/components/spaces/period-summary';
import { type Period } from '@/lib/periods';

const COUNTS: Record<Period, number> = { hourly: 3, daily: 1, weekly: 2, monthly: 3 };
const PRICES: Partial<Record<Period, string>> = { daily: 'Hot Desk, 650 taka per day.' };

function renderFilter(initialPeriod?: Period) {
  return render(
    <PeriodScope initialPeriod={initialPeriod}>
      <PeriodFilter action="/spaces#pricing" />
      <PeriodSummary counts={COUNTS} total={6} prices={PRICES} resetHref="/spaces" />
      <section data-testid="plan" data-offers="hourly daily" />
    </PeriodScope>,
  );
}

const scope = () => screen.getByTestId('plan').closest('[data-period-scope]');

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('Spaces period filter', () => {
  it('offers the four periods with nothing chosen at first', () => {
    renderFilter();
    const group = screen.getByRole('group', { name: 'How would you like to pay?' });
    const radios = within(group).getAllByRole('radio');
    expect(radios.map((radio) => radio.getAttribute('value'))).toEqual([
      'hourly',
      'daily',
      'weekly',
      'monthly',
    ]);
    for (const radio of radios) expect(radio).not.toBeChecked();
    expect(scope()).not.toHaveAttribute('data-period');
    expect(screen.queryByRole('link', { name: 'Show all plans' })).not.toBeInTheDocument();
  });

  it('starts from the period in the URL', () => {
    renderFilter('monthly');
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
    expect(scope()).toHaveAttribute('data-period', 'monthly');
    expect(screen.getByText('Showing the 3 plans you can book by the month.')).toBeInTheDocument();
  });

  it('filters at once, says what it shows and keeps the URL in step', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/spaces#hot-desk');
    renderFilter();

    await user.click(screen.getByRole('radio', { name: 'Daily' }));

    expect(scope()).toHaveAttribute('data-period', 'daily');
    expect(scope()).toHaveAttribute('data-period-changed');
    const live = screen.getByText('Showing the one plan you can book by the day.');
    expect(live).toHaveAttribute('aria-live', 'polite');
    // The prices the plans now lead with are read out in the same announcement.
    expect(live).toHaveTextContent(
      'Showing the one plan you can book by the day. Hot Desk, 650 taka per day.',
    );
    expect(window.location.search).toBe('?period=daily');
    expect(window.location.hash).toBe('#hot-desk');
  });

  it('goes back to every plan, returning focus to the choices', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/spaces?period=weekly');
    renderFilter('weekly');

    await user.click(screen.getByRole('link', { name: 'Show all plans' }));

    expect(scope()).not.toHaveAttribute('data-period');
    expect(window.location.search).toBe('');
    expect(screen.getByRole('radio', { name: 'Hourly' })).toHaveFocus();
    expect(screen.queryByRole('link', { name: 'Show all plans' })).not.toBeInTheDocument();
  });

  it('posts the period as a GET form without JS', () => {
    const { container } = renderFilter();
    const form = container.querySelector('form');
    expect(form).toHaveAttribute('method', 'get');
    expect(form).toHaveAttribute('action', '/spaces#pricing');
    expect(screen.getByRole('radio', { name: 'Weekly' })).toHaveAttribute('name', 'period');
  });
});
