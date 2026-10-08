import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CopyButton } from '@/components/ui/copy-button';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ toast }));

afterEach(() => {
  vi.restoreAllMocks();
  toast.mockClear();
});

describe('CopyButton', () => {
  it('copies the value and confirms with a toast', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    render(<CopyButton value="hello@example.com" label="Copy email" copiedMessage="Copied" />);

    await user.click(screen.getByRole('button', { name: 'Copy email' }));

    expect(writeText).toHaveBeenCalledWith('hello@example.com');
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Copied', tone: 'success' }),
    );
  });

  it('explains what to do when the clipboard is unavailable', async () => {
    const user = userEvent.setup();
    render(<CopyButton value="hello@example.com" label="Copy email" copiedMessage="Copied" />);
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));

    await user.click(screen.getByRole('button', { name: 'Copy email' }));

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'error' }));
  });
});
