import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NotFoundSection } from '@/components/sections/not-found-section';

describe('NotFoundSection', () => {
  it('says the page has not begun, as the page heading', () => {
    render(<NotFoundSection />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'This page hasn’t begun yet.',
    );
    expect(screen.getByRole('region', { name: 'This page hasn’t begun yet.' })).toBeInTheDocument();
  });

  it('offers the home page and spaces', () => {
    render(<NotFoundSection />);
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'See spaces and pricing' })).toHaveAttribute(
      'href',
      '/spaces',
    );
  });

  it('draws the line from CSS, at rest when motion is reduced', () => {
    const { container } = render(<NotFoundSection />);
    const line = container.querySelector('[aria-hidden="true"] path');
    expect(line).toHaveClass(
      'animate-draw-short',
      'motion-reduce:animate-none',
      'begin-line-short',
    );
  });
});
