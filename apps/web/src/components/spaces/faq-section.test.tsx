import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { plansSeed, siteSeed } from '@campus/contracts';

import { FaqSection } from '@/components/spaces/faq-section';
import { spacesFaq } from '@/lib/faq';

describe('FaqSection', () => {
  it('asks each question as a disclosure, with policy links in the answers', () => {
    const items = spacesFaq({ hours: siteSeed.hours, plans: plansSeed });
    const { container } = render(<FaqSection items={items} />);
    expect(screen.getByRole('region', { name: 'Good to know.' })).toBeInTheDocument();
    expect(container.querySelectorAll('details')).toHaveLength(items.length);
    expect(screen.getByText('When are you open?')).toBeInTheDocument();
    // Answers are closed, so their links are hidden until opened.
    expect(
      screen.getByRole('link', { name: 'Read the refund policy', hidden: true }),
    ).toHaveAttribute('href', '/legal/refund');
    expect(screen.getByRole('link', { name: 'Ask us' })).toHaveAttribute('href', '/contact');
  });

  it('leaves the section out with no questions', () => {
    const { container } = render(<FaqSection items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
