import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NameMeaning } from '@/components/about/name-meaning';

// next/font only runs inside the Next compiler.
vi.mock('@/styles/fonts-name', () => ({ nameFont: { variable: 'name-font' } }));

// A neutral fixture brand (CLAUDE.md: never the real brand name in tests).
const nameMeaning = { word: 'Ακμή', language: 'Greek', lang: 'el', meaning: 'peak' };

describe('NameMeaning', () => {
  it('says what the name means, with the word inside the heading', () => {
    render(<NameMeaning shortName="Acme" nameMeaning={nameMeaning} />);
    expect(screen.getByRole('region', { name: 'Ακμή Acme is Greek for peak.' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ακμή Acme is Greek for peak.',
    );
  });

  it('marks the word with its language', () => {
    render(<NameMeaning shortName="Acme" nameMeaning={nameMeaning} />);
    expect(screen.getByText('Ακμή')).toHaveAttribute('lang', 'el');
  });

  it('leaves the language unmarked when the brand gives no tag', () => {
    const { lang: _lang, ...untagged } = nameMeaning;
    render(<NameMeaning shortName="Acme" nameMeaning={untagged} />);
    expect(screen.getByText('Ακμή')).not.toHaveAttribute('lang');
  });

  it('is left out when the brand has no name meaning', () => {
    const { container } = render(<NameMeaning shortName="Acme" nameMeaning={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
