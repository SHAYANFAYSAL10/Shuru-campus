import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { plansSeed, siteSeed } from '@campus/contracts';

import { HomeHero } from '@/components/home/home-hero';

function renderHero(plans: Parameters<typeof HomeHero>[0]['plans'] = plansSeed) {
  render(<HomeHero hours={siteSeed.hours} plans={plans} />);
}

describe('HomeHero', () => {
  it('reads the headline once, as a sentence', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Your startup begins here.',
    );
  });

  it('offers both ways in', () => {
    renderHero();
    expect(screen.getByRole('link', { name: 'Find your space' })).toHaveAttribute(
      'href',
      '/spaces',
    );
    expect(screen.getByRole('link', { name: 'Book a visit' })).toHaveAttribute('href', '/contact');
  });

  it('leads with the open status, the starting price and the hours', () => {
    renderHero();
    const facts = within(screen.getByRole('list', { name: 'At a glance' }));

    expect(facts.getAllByRole('listitem')).toHaveLength(3);
    expect(facts.getByText(/^(Open now|Closed)/)).toBeInTheDocument();
    expect(facts.getByText('From 100 taka per hour')).toHaveClass('sr-only');
    expect(facts.getByText('Open Saturday to Thursday, 9:00–19:00')).toHaveClass('sr-only');
  });

  it('leaves the price out when plans are unavailable', () => {
    renderHero(null);
    const facts = within(screen.getByRole('list', { name: 'At a glance' }));

    expect(facts.getAllByRole('listitem')).toHaveLength(2);
    expect(facts.queryByText(/taka/)).not.toBeInTheDocument();
  });

  it('shows the photo with its description', () => {
    renderHero();
    expect(screen.getByRole('img', { name: /^Placeholder photo/ })).toBeInTheDocument();
  });
});
