import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { plansSeed } from '@campus/contracts';

import { AudienceSection } from '@/components/about/audience-section';

describe('AudienceSection', () => {
  it('links each audience to its plan, with the plan’s starting price', () => {
    render(<AudienceSection plans={plansSeed} />);
    const region = screen.getByRole('region', { name: 'Room for every kind of work.' });
    const tiles = within(region).getAllByRole('article');
    expect(tiles).toHaveLength(4);

    const first = screen.getByRole('article', { name: 'Freelancers & travelling professionals' });
    expect(within(first).getByRole('link', { name: 'See Hot Desk pricing' })).toHaveAttribute(
      'href',
      '/spaces/hot-desk',
    );
    expect(first).toHaveTextContent(/From\s*৳\s*100/);
  });

  it('points every tile at Spaces, without prices, when the plans failed to load', () => {
    render(<AudienceSection plans={null} />);
    const links = screen.getAllByRole('link', { name: 'See spaces & pricing' });
    expect(links).toHaveLength(4);
    for (const link of links) expect(link).toHaveAttribute('href', '/spaces');
    expect(screen.queryByText('From')).not.toBeInTheDocument();
  });
});
