import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';

describe('Breadcrumbs', () => {
  it('links every step but the current page, which it marks', () => {
    render(
      <Breadcrumbs
        trail={[
          { name: 'Spaces & pricing', path: '/spaces' },
          { name: 'Hot Desk', path: '/spaces/hot-desk' },
        ]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const items = within(nav).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(nav).getByRole('link', { name: 'Spaces & pricing' })).toHaveAttribute(
      'href',
      '/spaces',
    );
    expect(within(nav).queryByRole('link', { name: 'Hot Desk' })).not.toBeInTheDocument();
    expect(within(nav).getByText('Hot Desk')).toHaveAttribute('aria-current', 'page');
  });
});
