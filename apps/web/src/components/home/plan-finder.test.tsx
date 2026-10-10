import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { plansSeed } from '@campus/contracts';

import { PlanFinder } from '@/components/home/plan-finder';

async function answer(who: string, often: string, need: string) {
  const user = userEvent.setup();
  await user.click(
    within(screen.getByRole('group', { name: 'Who’s working?' })).getByRole('radio', { name: who }),
  );
  await user.click(
    within(screen.getByRole('group', { name: 'How often?' })).getByRole('radio', { name: often }),
  );
  await user.click(
    within(screen.getByRole('group', { name: 'What do you need?' })).getByRole('radio', {
      name: need,
    }),
  );
}

describe('PlanFinder', () => {
  it('asks three questions and waits for every answer', async () => {
    const user = userEvent.setup();
    render(<PlanFinder plans={plansSeed} />);
    const result = screen.getByRole('region', { name: 'Your match' });

    expect(screen.getAllByRole('group')).toHaveLength(3);
    expect(result).toHaveTextContent('0 of 3 answered');
    expect(within(result).getByRole('link', { name: 'Or compare every plan' })).toHaveAttribute(
      'href',
      '/spaces',
    );

    await user.click(screen.getByRole('radio', { name: 'Just me' }));
    expect(result).toHaveTextContent('1 of 3 answered');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('suggests a plan and books it with the matching rate', async () => {
    render(<PlanFinder plans={plansSeed} />);
    await answer('Just me', 'Days', 'Desk');

    const result = screen.getByRole('region', { name: 'Your match' });
    expect(await within(result).findByRole('heading', { name: 'Hot Desk' })).toBeInTheDocument();
    expect(result).toHaveTextContent('650 taka per day');
    expect(within(result).getByRole('link', { name: 'Book Hot Desk' })).toHaveAttribute(
      'href',
      '/contact?plan=hot-desk&rate=daily',
    );
    expect(within(result).getByRole('link', { name: 'Plan details: Hot Desk' })).toHaveAttribute(
      'href',
      '/spaces/hot-desk',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Suggested plan: Hot Desk, 650 taka per day.',
    );
  });

  it('keeps the card and rolls the price when only the rate changes', async () => {
    const user = userEvent.setup();
    render(<PlanFinder plans={plansSeed} />);
    await answer('Just me', 'Hours', 'Desk');

    const result = screen.getByRole('region', { name: 'Your match' });
    const heading = await within(result).findByRole('heading', { name: 'Hot Desk' });
    expect(result).toHaveTextContent('100 taka per hour');

    await user.click(
      within(screen.getByRole('group', { name: 'How often?' })).getByRole('radio', {
        name: 'Days',
      }),
    );

    // Same plan, same card: the heading isn't remounted, and the digits rolled to the new rate.
    expect(within(result).getByRole('heading', { name: 'Hot Desk' })).toBe(heading);
    expect(result).toHaveTextContent('650 taka per day');
    expect(result.querySelector('[data-odometer]')).toHaveAttribute('data-rolled');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Suggested plan: Hot Desk, 650 taka per day.',
    );
  });

  it('shows a "from" price and says how the plan is booked when the period does not fit', async () => {
    render(<PlanFinder plans={plansSeed} />);
    await answer('2–6 people', 'Weekly', 'Private room');

    const result = screen.getByRole('region', { name: 'Your match' });
    expect(
      await within(result).findByRole('heading', { name: 'Private Office' }),
    ).toBeInTheDocument();
    expect(result).toHaveTextContent('From');
    expect(result).toHaveTextContent('Booked by the month, not by the week.');
    // No size picked, so the inquiry carries only the plan.
    expect(within(result).getByRole('link', { name: 'Book Private Office' })).toHaveAttribute(
      'href',
      '/contact?plan=private-office',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Suggested plan: Private Office, from 40,000 taka per month.',
    );
  });

  it('names the room size for a meeting', async () => {
    render(<PlanFinder plans={plansSeed} />);
    await answer('2–6 people', 'Hours', 'Meeting');

    const result = screen.getByRole('region', { name: 'Your match' });
    expect(
      await within(result).findByRole('heading', { name: 'Meeting Room' }),
    ).toBeInTheDocument();
    expect(result).toHaveTextContent('Small · 6 people');
    expect(within(result).getByRole('link', { name: 'Book Meeting Room' })).toHaveAttribute(
      'href',
      '/contact?plan=meeting-room&rate=small',
    );
  });

  it('points to every plan when the suggestion is not offered', async () => {
    render(<PlanFinder plans={plansSeed.filter((plan) => plan.slug !== 'seminar-room')} />);
    await answer('An event', 'Hours', 'Meeting');

    const result = screen.getByRole('region', { name: 'Your match' });
    expect(await within(result).findByText('That one’s best talked through.')).toBeInTheDocument();
    expect(within(result).getByRole('link', { name: 'Compare every plan' })).toHaveAttribute(
      'href',
      '/spaces',
    );
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
