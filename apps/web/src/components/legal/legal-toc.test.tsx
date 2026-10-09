import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LegalToc } from '@/components/legal/legal-toc';

const ENTRIES = [
  { id: 'accommodation', title: 'Accommodation' },
  { id: 'use', title: 'Use' },
  { id: 'fees', title: 'Fees' },
];

/** Viewport tops of the three headings; the test moves them to "scroll". */
const tops: Record<string, number> = {};

function scrollTo(next: Record<string, number>, scrollY = 1) {
  Object.assign(tops, next);
  Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
    vi.runAllTimers();
  });
}

beforeEach(() => {
  // Fakes requestAnimationFrame too, so the scroll handler's frame runs on demand.
  vi.useFakeTimers();
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: 5000,
  });
  for (const { id } of ENTRIES) {
    const heading = document.createElement('h2');
    heading.id = id;
    heading.getBoundingClientRect = () => ({ top: tops[id] ?? 0 }) as DOMRect;
    document.body.append(heading);
  }
});

afterEach(() => {
  for (const { id } of ENTRIES) document.getElementById(id)?.remove();
  vi.useRealTimers();
});

const current = () =>
  screen.queryAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'location');

describe('LegalToc', () => {
  it('links to every section under "On this page"', () => {
    render(<LegalToc entries={ENTRIES} />);
    const nav = screen.getByRole('navigation', { name: 'On this page' });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '#accommodation',
      '#use',
      '#fees',
    ]);
  });

  it('marks nothing until the first section reaches the reading line', () => {
    render(<LegalToc entries={ENTRIES} />);
    scrollTo({ accommodation: 500, use: 1400, fees: 2400 }, 0);
    expect(current()).toHaveLength(0);
  });

  it('marks the section being read as the page scrolls', () => {
    render(<LegalToc entries={ENTRIES} />);
    scrollTo({ accommodation: 100, use: 900, fees: 1900 });
    expect(current().map((link) => link.textContent)).toEqual(['Accommodation']);

    scrollTo({ accommodation: -900, use: 200, fees: 1000 }, 1000);
    expect(current().map((link) => link.textContent)).toEqual(['Use']);
  });

  it('marks the last section at the end of the page', () => {
    render(<LegalToc entries={ENTRIES} />);
    // 4100 + 900 = the full 5000px: scrolled to the bottom, with Fees still low on the screen.
    scrollTo({ accommodation: -3000, use: -1500, fees: 700 }, 4100);
    expect(current().map((link) => link.textContent)).toEqual(['Fees']);
  });
});
