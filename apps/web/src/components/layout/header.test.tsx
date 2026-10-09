import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeaderShell } from '@/components/layout/header-shell';
import { PrimaryNav } from '@/components/layout/primary-nav';

const pathname = vi.hoisted(() => ({ current: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }));

const ITEMS = [
  { href: '/spaces', label: 'Spaces' },
  { href: '/about', label: 'About' },
];

describe('PrimaryNav', () => {
  it('marks the current page, and only it', () => {
    pathname.current = '/about';
    render(<PrimaryNav items={ITEMS} />);

    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Spaces' })).not.toHaveAttribute('aria-current');
  });

  it('marks the section for a page inside it', () => {
    pathname.current = '/spaces/hot-desk';
    render(<PrimaryNav items={ITEMS} />);

    expect(screen.getByRole('link', { name: 'Spaces' })).toHaveAttribute('aria-current', 'true');
  });
});

describe('HeaderShell', () => {
  beforeEach(() => {
    // Run frame callbacks immediately, so each scroll event updates the header.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    scrollTo(0);
  });

  function scrollTo(y: number) {
    act(() => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
      fireEvent.scroll(window);
    });
  }

  function renderHeader(pinned = false) {
    const result = render(
      <HeaderShell pinned={pinned}>
        <a href="/contact">Book a visit</a>
      </HeaderShell>,
    );
    return { header: screen.getByRole('banner'), ...result };
  }

  it('is expanded and visible at the top of the page', () => {
    const { header } = renderHeader();
    expect(header).not.toHaveAttribute('data-condensed');
    expect(header).not.toHaveAttribute('data-hidden');
  });

  it('condenses and hides on scroll-down, and shows again on scroll-up', () => {
    const { header } = renderHeader();

    scrollTo(300);
    scrollTo(600);
    expect(header).toHaveAttribute('data-condensed');
    expect(header).toHaveAttribute('data-hidden');

    scrollTo(500);
    expect(header).toHaveAttribute('data-condensed');
    expect(header).not.toHaveAttribute('data-hidden');
  });

  it('comes back and stays while focus is inside it', () => {
    const { header } = renderHeader();
    scrollTo(300);
    scrollTo(600);
    expect(header).toHaveAttribute('data-hidden');

    act(() => {
      screen.getByRole('link', { name: 'Book a visit' }).focus();
    });
    expect(header).not.toHaveAttribute('data-hidden');

    scrollTo(900);
    expect(header).not.toHaveAttribute('data-hidden');

    act(() => {
      screen.getByRole('link', { name: 'Book a visit' }).blur();
    });
    scrollTo(1200);
    expect(header).toHaveAttribute('data-hidden');
  });

  it('stays in view while pinned', () => {
    const { header, rerender } = renderHeader();
    scrollTo(300);
    scrollTo(600);
    expect(header).toHaveAttribute('data-hidden');

    rerender(
      <HeaderShell pinned>
        <a href="/contact">Book a visit</a>
      </HeaderShell>,
    );
    expect(header).not.toHaveAttribute('data-hidden');
  });

  it('starts condensed when the page loads scrolled', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 400 });
    const { header } = renderHeader();
    expect(header).toHaveAttribute('data-condensed');
    expect(header).not.toHaveAttribute('data-hidden');
  });
});
