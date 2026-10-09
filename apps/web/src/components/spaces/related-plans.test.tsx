import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { plansSeed } from '@campus/contracts';

import { RelatedPlans } from '@/components/spaces/related-plans';

describe('RelatedPlans', () => {
  it('links each suggested plan to its page and offers the full comparison', () => {
    render(<RelatedPlans plans={plansSeed.slice(1, 4)} />);
    const region = screen.getByRole('region', { name: 'Need a different size?' });
    const list = within(region).getByRole('list', { name: 'Other plans' });
    expect(within(list).getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(within(list).getByRole('link', { name: 'Business Seating' })).toHaveAttribute(
      'href',
      '/spaces/business-seating',
    );
    expect(within(region).getByRole('link', { name: 'Compare all plans' })).toHaveAttribute(
      'href',
      '/spaces',
    );
  });

  it('is left out when there is nothing to suggest', () => {
    const { container } = render(<RelatedPlans plans={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
