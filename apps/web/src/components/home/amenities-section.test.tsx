import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { amenitiesSeed } from '@campus/contracts';

import { AmenitiesSection } from '@/components/home/amenities-section';

// jsdom applies no CSS, so both layouts are in the DOM here: the marquee (below `md`) and the
// bento grid (from `md`). The responsive suite checks that only one shows at a time.
function bento() {
  const lists = screen.getAllByRole('list', { name: 'Amenities' });
  const grid = lists.find((list) => list.className.includes('md:grid'));
  if (!grid) throw new Error('no bento grid');
  return grid;
}

describe('AmenitiesSection', () => {
  it('numbers its eyebrow and titles the region', () => {
    render(<AmenitiesSection amenities={amenitiesSeed} number={2} />);
    expect(screen.getByRole('region', { name: 'Everything the day needs.' })).toBeInTheDocument();
    expect(screen.getByText('Amenities', { selector: 'p' })).toHaveTextContent('02 — Amenities');
  });

  it('lists every amenity with its description in the bento', () => {
    render(<AmenitiesSection amenities={amenitiesSeed} />);
    const tiles = within(bento()).getAllByRole('listitem');
    expect(tiles).toHaveLength(amenitiesSeed.length);
    for (const amenity of amenitiesSeed) {
      const tile = within(bento()).getByRole('heading', { name: amenity.name }).closest('li');
      expect(tile).toHaveTextContent(amenity.description);
    }
  });

  it('leads the bento with a 2×2 feature tile and closes its rows', () => {
    render(<AmenitiesSection amenities={amenitiesSeed} />);
    const [first, second] = within(bento()).getAllByRole('listitem');
    expect(first).toHaveClass('md:col-span-2', 'md:row-span-2', 'lg:row-span-2', 'surface-brand');
    expect(second).toHaveClass('lg:col-span-2');
  });

  it('is a plain list of names in the SSR HTML on phones (the marquee only moves with JS)', () => {
    const html = renderToString(<AmenitiesSection amenities={amenitiesSeed} />);
    expect(html).not.toContain('animate-marquee');
    expect(html).toContain('Unlimited Tea &amp; Coffee');
  });

  it('renders nothing without amenities', () => {
    const { container } = render(<AmenitiesSection amenities={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
