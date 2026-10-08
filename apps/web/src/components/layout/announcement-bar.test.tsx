import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AnnouncementBar } from '@/components/layout/announcement-bar';
import {
  ANNOUNCEMENT_DISMISSED_ATTR,
  ANNOUNCEMENT_STORAGE_KEY,
  announcementId,
} from '@/lib/announcement';
import { MAIN_CONTENT_ID } from '@/lib/navigation';
import { duration } from '@/styles/motion';

const ANNOUNCEMENT = { enabled: true, text: 'Open this Friday for Victory Day', href: '/contact' };

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
  document.documentElement.removeAttribute(ANNOUNCEMENT_DISMISSED_ATTR);
});

describe('AnnouncementBar', () => {
  it('renders nothing when the banner is off', () => {
    const { container } = render(
      <AnnouncementBar announcement={{ ...ANNOUNCEMENT, enabled: false }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the message as a link in a labelled region', () => {
    render(<AnnouncementBar announcement={ANNOUNCEMENT} />);

    expect(screen.getByRole('region', { name: 'Announcement' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ANNOUNCEMENT.text })).toHaveAttribute(
      'href',
      '/contact',
    );
  });

  it('says when an external link opens a new tab', () => {
    render(
      <AnnouncementBar announcement={{ ...ANNOUNCEMENT, href: 'https://example.com/event' }} />,
    );
    expect(screen.getByRole('link', { name: /opens in a new tab/ })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('remembers the dismissed message and moves focus on to the page', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    render(
      <>
        <AnnouncementBar announcement={ANNOUNCEMENT} />
        <main id={MAIN_CONTENT_ID} tabIndex={-1} />
      </>,
    );
    const id = announcementId(ANNOUNCEMENT);

    await user.click(screen.getByRole('button', { name: 'Dismiss announcement' }));
    expect(screen.getByRole('region', { name: 'Announcement' })).toHaveAttribute('data-leaving');
    expect(localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY)).toBe(id);

    act(() => {
      vi.advanceTimersByTime(duration.fast);
    });
    expect(document.documentElement.getAttribute(ANNOUNCEMENT_DISMISSED_ATTR)).toBe(id);
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('carries a rule that hides it once its id is on <html>', () => {
    render(<AnnouncementBar announcement={ANNOUNCEMENT} />);
    const id = announcementId(ANNOUNCEMENT);
    const rule = document.querySelector('style')?.textContent ?? '';

    expect(rule).toContain(`[${ANNOUNCEMENT_DISMISSED_ATTR}~="${id}"]`);
    expect(rule).toContain(`[data-announcement="${id}"]`);
  });
});
