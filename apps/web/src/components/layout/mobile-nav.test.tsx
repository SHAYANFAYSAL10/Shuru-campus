import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type OpeningHours } from '@campus/contracts';

import { MobileNav } from '@/components/layout/mobile-nav';
import { MEDIA } from '@/lib/hooks/use-media-query';
import { setMediaQuery } from '@/test/media';

const pathname = vi.hoisted(() => ({ current: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }));

const ITEMS = [
  { href: '/spaces', label: 'Spaces' },
  { href: '/about', label: 'About' },
];

const HOURS: OpeningHours = {
  timezone: 'Asia/Dhaka',
  weekly: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: '09:00', close: '19:00' })),
};

function MobileNavExample() {
  return (
    <MobileNav
      items={ITEMS}
      hours={HOURS}
      memberLoginUrl="https://members.example.com"
      bar={<a href="/contact">Book a visit</a>}
    />
  );
}

// jsdom can't navigate; stop link clicks from trying (the menu reacts to the click itself).
function preventNavigation(event: MouseEvent) {
  if (event.target instanceof Element && event.target.closest('a[href]')) event.preventDefault();
}

describe('MobileNav', () => {
  beforeEach(() => {
    pathname.current = '/spaces/hot-desk';
    window.addEventListener('click', preventNavigation, { capture: true });
  });

  afterEach(() => {
    window.removeEventListener('click', preventNavigation, { capture: true });
  });

  async function openMenu() {
    const user = userEvent.setup();
    const result = render(<MobileNavExample />);
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Menu' });
    return { user, trigger, dialog, ...result };
  }

  it('opens as a named dialog with the nav, focusing the close button', async () => {
    const { dialog } = await openMenu();

    const nav = within(dialog).getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Spaces' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(within(nav).getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
    expect(within(dialog).getByRole('link', { name: 'Book a visit' })).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: /Member login/ })).toHaveAttribute(
      'href',
      'https://members.example.com',
    );
    expect(within(dialog).getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Close menu' })).toHaveFocus();
  });

  it('closes on Esc and returns focus to the menu button', async () => {
    const { user, trigger } = await openMenu();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(trigger).toHaveFocus();
  });

  it('closes when a link is followed, even to the current page', async () => {
    const { user, dialog } = await openMenu();

    await user.click(within(dialog).getByRole('link', { name: 'Book a visit' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('stays open for a modified click (new tab)', async () => {
    const { dialog } = await openMenu();

    fireEvent.click(within(dialog).getByRole('link', { name: 'About' }), { metaKey: true });
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument();
  });

  it('closes on a route change', async () => {
    const { rerender } = await openMenu();

    pathname.current = '/about';
    rerender(<MobileNavExample />);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    // Coming back to the page it was opened on does not reopen it.
    pathname.current = '/spaces/hot-desk';
    rerender(<MobileNavExample />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes for good when the window widens to the desktop nav', async () => {
    const { rerender } = await openMenu();

    setMediaQuery(MEDIA.wideNav, true);
    rerender(<MobileNavExample />);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    act(() => {
      setMediaQuery(MEDIA.wideNav, false);
    });
    rerender(<MobileNavExample />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
