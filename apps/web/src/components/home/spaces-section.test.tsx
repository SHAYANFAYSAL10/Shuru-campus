import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { plansSeed } from '@campus/contracts';

import { SpacesSection } from '@/components/home/spaces-section';

describe('SpacesSection', () => {
  it('numbers its eyebrow and titles the region', () => {
    render(<SpacesSection plans={plansSeed} number={1} />);
    expect(screen.getByRole('region', { name: 'A space for every stage.' })).toBeInTheDocument();
    expect(screen.getByText('Spaces').closest('p')).toHaveTextContent('01 — Spaces');
  });

  it('shows every plan as a card linking to its page, in plan order', () => {
    render(<SpacesSection plans={[...plansSeed].reverse()} />);
    const names = within(screen.getByRole('list', { name: 'Plans' })).getAllByRole('heading', {
      level: 3,
    });
    expect(names.map((name) => name.textContent)).toEqual(plansSeed.map((plan) => plan.name));
    expect(screen.getByRole('link', { name: 'Hot Desk' })).toHaveAttribute(
      'href',
      '/spaces/hot-desk',
    );
  });

  it('gives each card its audience, starting price and three features', () => {
    render(<SpacesSection plans={plansSeed} />);
    const card = screen.getByRole('heading', { name: 'Private Office' }).closest('li');
    if (!card) throw new Error('no card');
    expect(card).toHaveTextContent('Satellite teams, Companies of 1–6 people');
    // Seen as "From ৳40,000/month", heard as "40,000 taka per month".
    expect(card).toHaveTextContent(/From.*40,000 taka per month/);
    expect(within(card).getAllByRole('listitem')).toHaveLength(3);
    expect(within(card).getByRole('img')).toHaveAccessibleName('Placeholder photo: Private Office');
  });

  it('marks only the highlighted plan as popular', () => {
    render(<SpacesSection plans={plansSeed} />);
    const badges = screen.getAllByText('Popular');
    expect(badges).toHaveLength(plansSeed.filter((p) => p.highlight).length);
    expect(badges[0]?.closest('li')).toHaveTextContent('Business Seating');
  });

  it('links to the full comparison', () => {
    render(<SpacesSection plans={plansSeed} />);
    expect(screen.getByRole('link', { name: 'Compare all plans' })).toHaveAttribute(
      'href',
      '/spaces',
    );
  });

  it('says so, and offers a person, when plans fail to load', () => {
    render(<SpacesSection plans={null} />);
    expect(screen.queryByRole('list', { name: 'Plans' })).not.toBeInTheDocument();
    expect(screen.getByText('Plans and prices aren’t loading right now.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '/contact');
  });

  it('has an empty state when there are no plans', () => {
    render(<SpacesSection plans={[]} />);
    expect(screen.getByText('Our plans are being updated right now.')).toBeInTheDocument();
  });
});
