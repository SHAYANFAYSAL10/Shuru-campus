import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { defaultBrand } from '@campus/contracts';

import { PillarsSection } from '@/components/about/pillars-section';

describe('PillarsSection', () => {
  it('gives each pillar a heading and its statement, in order', () => {
    render(<PillarsSection pillars={defaultBrand.pillars} subTagline={defaultBrand.subTagline} />);
    const region = screen.getByRole('region', { name: 'What we stand for.' });
    const items = within(region).getAllByRole('listitem');
    expect(
      items.map((item) => within(item).getByRole('heading', { level: 3 }).textContent),
    ).toEqual(defaultBrand.pillars);
    expect(items[0]).toHaveTextContent(/Empower your business/);
  });

  it('leads with the sub-tagline as a sentence', () => {
    render(<PillarsSection pillars={['Empower']} subTagline="Built for work" />);
    expect(screen.getByText('Built for work.')).toBeVisible();
  });

  it('keeps a pillar that has no statement, without one', () => {
    render(<PillarsSection pillars={['Focus']} subTagline={defaultBrand.subTagline} />);
    const item = screen.getByRole('listitem');
    expect(within(item).getByRole('heading', { name: 'Focus' })).toBeVisible();
    expect(within(item).queryAllByText(/Focus /)).toHaveLength(0);
  });
});
