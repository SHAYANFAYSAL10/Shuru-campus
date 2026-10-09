import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { defaultBrand } from '@campus/contracts';

import { Manifesto } from '@/components/home/manifesto';

describe('Manifesto', () => {
  it('titles the section with the pillars, read as a list', () => {
    render(<Manifesto pillars={defaultBrand.pillars} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
      'Empower, Enhance, Enrich',
    );
  });

  it('opens each statement with its pillar', () => {
    render(<Manifesto pillars={defaultBrand.pillars} />);
    for (const pillar of defaultBrand.pillars) {
      expect(screen.getByText(pillar, { selector: 'em' }).closest('p')).toHaveTextContent(
        new RegExp(`^${pillar} your `),
      );
    }
  });

  it('only shows pillars it has a statement for', () => {
    render(<Manifesto pillars={['Focus', 'Enrich']} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName('Enrich');
    expect(screen.queryByText('Focus')).not.toBeInTheDocument();
  });

  it('renders nothing when no pillar has a statement', () => {
    const { container } = render(<Manifesto pillars={['Focus']} />);
    expect(container).toBeEmptyDOMElement();
  });
});
