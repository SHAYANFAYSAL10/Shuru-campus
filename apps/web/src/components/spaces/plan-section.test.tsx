import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { plansSeed, type Plan } from '@campus/contracts';

import { PlanSection } from '@/components/spaces/plan-section';

function seedPlan(slug: Plan['slug']): Plan {
  const plan = plansSeed.find((p) => p.slug === slug);
  if (!plan) throw new Error(`seed has no ${slug}`);
  return plan;
}

describe('PlanSection', () => {
  it('is a region anchored at the slug, carrying the periods it offers', () => {
    render(<PlanSection plan={seedPlan('hot-desk')} index={0} />);
    const region = screen.getByRole('region', { name: 'Hot Desk' });
    expect(region).toHaveAttribute('id', 'hot-desk');
    expect(region).toHaveAttribute('data-offers', 'hourly daily');
    expect(region).toHaveTextContent(
      'For freelancers, independent professionals and travelling professionals',
    );
  });

  it('lists every rate with its own booking link', () => {
    render(<PlanSection plan={seedPlan('meeting-room')} index={0} />);
    const rates = screen.getByRole('list', { name: 'Rates' });
    const items = within(rates).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute('data-rate-period', 'hourly');
    expect(items[0]).toHaveTextContent(/Big.*10 people.*1,000 taka per hour/);
    expect(
      within(rates).getByRole('link', { name: 'Book this: Meeting Room, Big, 10 people' }),
    ).toHaveAttribute('href', '/contact?plan=meeting-room&rate=big');
  });

  it('lists everything included', () => {
    const plan = seedPlan('executive-seating');
    render(<PlanSection plan={plan} index={1} />);
    const included = screen.getByRole('list', { name: 'Included with Executive Seating' });
    expect(within(included).getAllByRole('listitem')).toHaveLength(plan.features.length);
    expect(included).toHaveTextContent('2 hours free meeting room · Per month');
  });

  it('offers other sizes only for plans priced by size', () => {
    const { unmount } = render(<PlanSection plan={seedPlan('private-office')} index={0} />);
    expect(screen.getByRole('link', { name: 'Ask us' })).toHaveAttribute(
      'href',
      '/contact?plan=private-office',
    );
    unmount();
    render(<PlanSection plan={seedPlan('hot-desk')} index={0} />);
    expect(screen.queryByRole('link', { name: 'Ask us' })).not.toBeInTheDocument();
  });

  it('marks the highlighted plan as popular', () => {
    render(<PlanSection plan={seedPlan('business-seating')} index={0} />);
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('heads the page on the plan’s own page, with its parts a level below', () => {
    render(<PlanSection plan={seedPlan('hot-desk')} index={0} headingLevel="h1" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Hot Desk' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Rates' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Included' })).toBeInTheDocument();
  });
});
