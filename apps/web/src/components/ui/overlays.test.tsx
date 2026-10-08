import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from 'lucide-react';
import NextLink from 'next/link';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { siteSeed } from '@campus/contracts';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { OpenStatus } from '@/components/ui/open-status';
import { Price } from '@/components/ui/price';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { clearToasts, toast } from '@/lib/toast';

function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Book a tour</Button>
      </DialogTrigger>
      <DialogContent
        title="Book a tour"
        description="Pick a day and we'll show you around."
        footer={<Button>Confirm</Button>}
      >
        <input aria-label="Your name" />
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('opens as a named, described modal and moves focus inside', async () => {
    const user = userEvent.setup();
    render(<DialogExample />);
    await user.click(screen.getByRole('button', { name: 'Book a tour' }));

    const dialog = await screen.findByRole('dialog', { name: 'Book a tour' });
    expect(dialog).toHaveAccessibleDescription("Pick a day and we'll show you around.");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('traps focus while open', async () => {
    const user = userEvent.setup();
    render(<DialogExample />);
    await user.click(screen.getByRole('button', { name: 'Book a tour' }));
    const dialog = await screen.findByRole('dialog');

    for (let i = 0; i < 6; i += 1) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it('closes on Esc and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<DialogExample />);
    const trigger = screen.getByRole('button', { name: 'Book a tour' });
    await user.click(trigger);
    await screen.findByRole('dialog');

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(trigger).toHaveFocus();
  });

  it('closes from its close button', async () => {
    const user = userEvent.setup();
    render(<DialogExample />);
    await user.click(screen.getByRole('button', { name: 'Book a tour' }));
    await user.click(await screen.findByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});

describe('Sheet', () => {
  it('names itself even with a hidden title, and closes on Esc with focus restored', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Menu</Button>
        </SheetTrigger>
        <SheetContent title="Site menu" hideTitle side="full">
          <NextLink href="/spaces">Spaces</NextLink>
        </SheetContent>
      </Sheet>,
    );
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    expect(await screen.findByRole('dialog', { name: 'Site menu' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(trigger).toHaveFocus();
  });
});

describe('Toast', () => {
  afterEach(() => {
    act(() => {
      clearToasts();
    });
  });

  it('shows and announces a toast, and can be dismissed', async () => {
    const user = userEvent.setup();
    render(<Toaster />);
    act(() => {
      toast({
        title: 'Email copied',
        description: 'Paste it into your mail app.',
        tone: 'success',
      });
    });

    expect(await screen.findAllByText('Email copied')).not.toHaveLength(0);
    // Radix mirrors the text into a live region for screen readers.
    await waitFor(() => {
      const regions = screen.getAllByRole('status');
      expect(regions.some((r) => r.textContent.includes('Email copied'))).toBe(true);
    });

    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    await waitFor(() => {
      expect(screen.queryByText('Paste it into your mail app.')).toBeNull();
    });
  });

  it('has a keyboard-reachable notifications region', () => {
    render(<Toaster />);
    expect(screen.getByRole('region', { name: /Notification/ })).toBeInTheDocument();
  });
});

describe('Tooltip', () => {
  it("shows an icon button's label on keyboard focus", async () => {
    const user = userEvent.setup();
    render(<IconButton label="Settings" icon={Settings} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Settings');

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });
});

describe('Price', () => {
  it('reads naturally to screen readers and hides the visual parts', () => {
    const { container } = render(<Price amount={10000} rate={{ unit: 'month' }} />);
    expect(screen.getByText('10,000 taka per month')).toHaveClass('sr-only');
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(container.textContent).toContain('৳10,000');
  });

  it('labels block rates with their hours', () => {
    render(<Price amount={4000} rate={{ unit: 'block', blockHours: 4 }} />);
    expect(screen.getByText('4,000 taka per 4 hours')).toBeInTheDocument();
  });
});

describe('Skeleton', () => {
  it('is hidden from assistive tech', () => {
    const { container } = render(<Skeleton className="h-4 w-24" />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('OpenStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // Dhaka is UTC+6. 2026-10-08 is a Thursday, 10-09 Friday (closed), 10-10 Saturday.
  const at = (iso: string) => {
    vi.setSystemTime(new Date(iso));
  };

  it('holds its place with a skeleton in the SSR HTML', () => {
    const html = renderToString(<OpenStatus hours={siteSeed.hours} />);
    expect(html).toContain('Checking opening hours');
    expect(html).not.toContain('Open now');
  });

  it.each([
    ['2026-10-10T04:00:00Z', 'Saturday 10:00', 'Open now · until 19:00'],
    ['2026-10-10T12:59:00Z', 'Saturday 18:59', 'Open now · until 19:00'],
    ['2026-10-10T13:00:00Z', 'Saturday 19:00', 'Closed · opens Sun 9:00'],
    ['2026-10-10T02:30:00Z', 'Saturday 08:30', 'Closed · opens 9:00'],
    ['2026-10-09T06:00:00Z', 'Friday noon', 'Closed · opens Sat 9:00'],
    ['2026-10-08T14:00:00Z', 'Thursday 20:00', 'Closed · opens Sat 9:00'],
  ])('%s (%s) → %s', (iso, _when, text) => {
    at(iso);
    render(<OpenStatus hours={siteSeed.hours} />);
    expect(screen.getByText(/^(Open now|Closed)/).parentElement?.textContent ?? '').toContain(text);
  });

  it('updates when the minute ticks over a closing time', () => {
    at('2026-10-10T12:59:30Z');
    render(<OpenStatus hours={siteSeed.hours} />);
    expect(screen.getByText(/Open now/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(screen.getByText(/Closed/)).toBeInTheDocument();
  });

  it('reads "Closed" when no day is open', () => {
    at('2026-10-10T04:00:00Z');
    const closed = {
      ...siteSeed.hours,
      weekly: siteSeed.hours.weekly.map((d) => ({ ...d, open: null, close: null })),
    };
    render(<OpenStatus hours={closed} />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });
});
