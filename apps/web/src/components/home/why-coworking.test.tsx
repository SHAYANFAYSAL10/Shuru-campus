import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WhyCoworking } from '@/components/home/why-coworking';
import { EXPLAINERS } from '@/lib/explainers';

describe('WhyCoworking', () => {
  it('numbers its eyebrow and titles the region', () => {
    render(<WhyCoworking number={3} />);
    expect(screen.getByRole('region', { name: 'Why share a workspace?' })).toBeInTheDocument();
    expect(screen.getByText('Why co-working', { selector: 'p' })).toHaveTextContent(
      '03 — Why co-working',
    );
  });

  it('quotes each idea and cites its source in a new tab', () => {
    render(<WhyCoworking />);
    for (const explainer of EXPLAINERS) {
      const column = screen.getByRole('article', { name: explainer.title });
      const quote = within(column).getByRole('blockquote');
      expect(quote).toHaveAttribute('cite', explainer.source.url);
      expect(quote).toHaveTextContent(explainer.quote);
      const source = within(column).getByRole('link', { name: new RegExp(explainer.source.name) });
      expect(source).toHaveAttribute('href', explainer.source.url);
      expect(source).toHaveAttribute('target', '_blank');
      expect(column).toHaveTextContent(explainer.here);
    }
  });
});
