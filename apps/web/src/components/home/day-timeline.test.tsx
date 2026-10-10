import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { siteSeed } from '@campus/contracts';

import { DaySection } from '@/components/home/day-section';
import { DayTimeline } from '@/components/home/day-timeline';

const { hours } = siteSeed;

/** Pins the clock; Dhaka is UTC+6. 2026-10-10 is a Saturday, 2026-10-09 a Friday (closed). */
function at(iso: string) {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(iso));
}

describe('DayTimeline', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('lists the moments of the day in order, each with its time', () => {
    at('2026-10-10T08:32:00Z');
    render(<DayTimeline hours={hours} />);
    const list = screen.getByRole('list', { name: 'The day, hour by hour' });
    expect(list.tagName).toBe('OL');
    const items = within(list).getAllByRole('listitem');
    expect(
      items.map((item) => within(item).getByRole('heading', { level: 3 }).textContent),
    ).toEqual(['Arrive & coffee', 'Deep work', 'Lunch', 'Meeting room', 'Timeout zone', 'Close']);
    expect(items[0]?.querySelector('time')).toHaveAttribute('datetime', '09:00');
  });

  it('marks the current Dhaka time while open', () => {
    at('2026-10-10T08:32:00Z'); // 14:32 Saturday
    render(<DayTimeline hours={hours} />);
    const now = screen
      .getAllByRole('listitem')
      .filter((item) => item.getAttribute('aria-current') === 'time');
    expect(now).toHaveLength(1);
    expect(now[0]).toHaveTextContent('Lunch');
    expect(now[0]).toHaveTextContent('Now 14:32');
    expect(screen.getByText(/in Dhaka/)).toHaveTextContent(
      '14:32 in Dhaka · Open now, until 19:00',
    );
  });

  it('has no marker while closed, and says when it opens', () => {
    at('2026-10-09T08:00:00Z'); // 14:00 Friday
    render(<DayTimeline hours={hours} />);
    expect(screen.queryByText(/^Now/)).not.toBeInTheDocument();
    for (const item of screen.getAllByRole('listitem')) {
      expect(item).not.toHaveAttribute('aria-current');
    }
    expect(screen.getByText(/in Dhaka/)).toHaveTextContent('Closed, opens Sat 9:00');
  });

  it('server-renders the week’s hours instead of a time it can’t know', () => {
    const html = renderToString(<DayTimeline hours={hours} />);
    expect(html).toContain('Sat–Thu 9:00–19:00 · Fri closed');
    expect(html).not.toContain('Now');
    expect(html).not.toContain('aria-current');
  });
});

describe('DaySection', () => {
  it('titles the lake band with the brand’s short name in the eyebrow', () => {
    render(<DaySection shortName="Acme" hours={hours} number={4} />);
    expect(screen.getByRole('region', { name: 'How a day here unfolds.' })).toHaveClass(
      'surface-brand',
    );
    expect(screen.getByText('A day at Acme', { exact: false })).toHaveTextContent(
      '04 — A day at Acme',
    );
  });
});
