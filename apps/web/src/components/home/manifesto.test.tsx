import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { defaultBrand } from '@campus/contracts';

import { Manifesto } from '@/components/home/manifesto';
import { scrollText } from '@/styles/motion';

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

  it('reads each statement once, as one sentence, while its words brighten one by one', () => {
    render(<Manifesto pillars={['Enhance']} />);
    const statement = screen.getByText('Enhance', { selector: 'em' }).closest('p');
    expect(statement).toHaveTextContent(
      /^Enhance your work in a professional, tranquil and buoyant atmosphere\.$/,
    );
    const words = statement?.querySelectorAll<HTMLElement>('.scroll-text-word') ?? [];
    expect(words).toHaveLength(10);
    expect(words[0]?.style.getPropertyValue('--word-from')).toBe(`${scrollText.start}%`);
    expect(words[9]?.style.getPropertyValue('--word-to')).toBe(`${scrollText.end}%`);
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
