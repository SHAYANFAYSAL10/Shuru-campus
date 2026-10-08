import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
});

describe('ThemeToggle', () => {
  it('offers System, Light and Dark, with System as the default', async () => {
    renderToggle();
    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio').map((r) => r.getAttribute('value'))).toEqual([
      'system',
      'light',
      'dark',
    ]);
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
    });
  });

  it('applies and remembers the choice', async () => {
    const user = userEvent.setup();
    renderToggle();
    await user.click(screen.getByRole('radio', { name: 'Dark' }));
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
    expect(localStorage.getItem('theme')).toBe('dark');

    await user.keyboard('{ArrowLeft}');
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('light');
    });
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('restores a stored choice', async () => {
    localStorage.setItem('theme', 'light');
    renderToggle();
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
    });
  });
});
