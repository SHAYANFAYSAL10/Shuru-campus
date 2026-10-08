import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { siteSeed } from '@campus/contracts';

import { HoursTable } from '@/components/home/hours-table';
import { VisitSection } from '@/components/home/visit-section';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ toast }));

const { contact, hours } = siteSeed;

describe('VisitSection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    toast.mockClear();
  });

  it('numbers its eyebrow and titles the region', () => {
    render(<VisitSection contact={contact} hours={hours} number={4} />);
    expect(
      screen.getByRole('region', { name: 'Come and see it for yourself.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Visit us', { selector: 'p' })).toHaveTextContent('04 — Visit us');
  });

  it('links the map to Google Maps and gives the address', () => {
    render(<VisitSection contact={contact} hours={hours} />);
    expect(screen.getByRole('link', { name: 'Open in Google Maps' })).toHaveAttribute(
      'href',
      contact.mapUrl,
    );
    for (const line of contact.addressLines) {
      expect(screen.getByText(line).closest('address')).toBeInTheDocument();
    }
  });

  it('calls each number and writes or copies the email', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    render(<VisitSection contact={contact} hours={hours} />);

    expect(screen.getByRole('link', { name: '+88 09666-731731' })).toHaveAttribute(
      'href',
      'tel:+8809666731731',
    );
    expect(screen.getByRole('link', { name: '+88 01700-766084' })).toHaveAttribute(
      'href',
      'tel:+8801700766084',
    );
    expect(screen.getByRole('link', { name: contact.email })).toHaveAttribute(
      'href',
      `mailto:${contact.email}`,
    );

    await user.click(screen.getByRole('button', { name: 'Copy email address' }));
    expect(writeText).toHaveBeenCalledWith(contact.email);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Email address copied', tone: 'success' }),
    );
  });
});

describe('HoursTable', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('lists the whole week from Saturday, with Friday closed', () => {
    // Friday in Dhaka, so the marked row is the last.
    vi.setSystemTime(new Date('2026-10-09T06:00:00Z'));
    render(<HoursTable hours={hours} />);
    const table = screen.getByRole('table', { name: 'Opening hours, Dhaka time' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(
      rows.map((row) =>
        within(row)
          .getByRole('rowheader')
          .textContent.replace(/Today$/, ''),
      ),
    ).toEqual(['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    expect(rows[0]).toHaveTextContent('9:00–19:00');
    expect(rows[6]).toHaveTextContent('FridayTodayClosed');
  });

  it('marks no day in the server HTML, so a cached page never shows a stale today', () => {
    vi.setSystemTime(new Date('2026-10-10T04:00:00Z'));
    const html = renderToString(<HoursTable hours={hours} />);
    expect(html).not.toContain('Today');
    expect(html).not.toContain('aria-current');
  });

  it.each([
    // Dhaka is UTC+6: 2026-10-09 23:30 UTC is already Saturday in Dhaka.
    ['2026-10-09T23:30:00Z', 'Saturday'],
    ['2026-10-09T06:00:00Z', 'Friday'],
    ['2026-10-08T12:00:00Z', 'Thursday'],
  ])('marks today in Dhaka time (%s → %s)', (iso, day) => {
    vi.setSystemTime(new Date(iso));
    render(<HoursTable hours={hours} />);
    const today = screen.getByRole('row', { current: 'date' });
    expect(within(today).getByRole('rowheader')).toHaveTextContent(`${day}Today`);
    expect(screen.getAllByText('Today')).toHaveLength(1);
  });
});
