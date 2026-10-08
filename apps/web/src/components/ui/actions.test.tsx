import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { X } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { IconButton } from '@/components/ui/icon-button';
import { Link } from '@/components/ui/link';

describe('Button', () => {
  it('is a type="button" by default so it never submits a form by accident', () => {
    render(<Button>Book a tour</Button>);
    expect(screen.getByRole('button', { name: 'Book a tour' })).toHaveAttribute('type', 'button');
  });

  it('calls onClick when enabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Send inquiry</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('keeps focus and width while loading, blocks clicks and announces the loading label', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Send inquiry</Button>);
    const button = screen.getByRole('button', { name: 'Send inquiry' });
    button.focus();

    rerender(
      <Button onClick={onClick} loading loadingLabel="Sending inquiry">
        Send inquiry
      </Button>,
    );
    expect(button).toHaveFocus();
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAccessibleName('Sending inquiry');
    // The label stays in the layout (invisible), so the width doesn't change.
    expect(screen.getByText('Send inquiry')).toHaveClass('invisible');

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is skipped by clicks when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Book
      </Button>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('can style a link as a button', () => {
    render(
      <Button asChild variant="secondary">
        <a href="/contact">Contact us</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Contact us' });
    expect(link).toHaveAttribute('href', '/contact');
    expect(link).toHaveClass('rounded-full');
  });
});

describe('IconButton', () => {
  it('names itself from the label and hides the icon', () => {
    const { container } = render(<IconButton label="Close dialog" icon={X} />);
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Link', () => {
  it('renders an internal link', () => {
    render(<Link href="/spaces">See all spaces</Link>);
    expect(screen.getByRole('link', { name: 'See all spaces' })).toHaveAttribute('href', '/spaces');
  });

  it('opens external links in a new tab and tells screen readers', () => {
    render(
      <Link href="https://example.com/map" external>
        Open in Maps
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Open in Maps (opens in a new tab)' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('draws the begin line under standalone links', () => {
    render(
      <Link href="/spaces/hot-desk" variant="standalone">
        See Hot Desk pricing
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('link-draw');
  });
});

describe('Chip', () => {
  it('toggles and reports its pressed state', async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Chip selected={false} onClick={onClick}>
        Events
      </Chip>,
    );
    const chip = screen.getByRole('button', { name: 'Events' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    expect(onClick).toHaveBeenCalledOnce();

    rerender(
      <Chip selected onClick={onClick}>
        Events
      </Chip>,
    );
    expect(chip).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Badge', () => {
  it('renders static text', () => {
    render(<Badge tone="accent">Popular</Badge>);
    expect(screen.getByText('Popular')).toHaveClass('bg-accent-subtle', 'text-accent-text');
  });
});
