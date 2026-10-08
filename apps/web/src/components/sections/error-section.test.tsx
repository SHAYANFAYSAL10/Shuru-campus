import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorSection } from '@/components/sections/error-section';

const report = vi.hoisted(() => vi.fn());
vi.mock('@/lib/report-error', () => ({ reportError: report }));

afterEach(() => {
  report.mockReset();
});

const serverError = Object.assign(new Error('An error occurred in the Server Components render.'), {
  digest: '2938471',
});

describe('ErrorSection', () => {
  it('explains what happened and moves focus to the heading', () => {
    render(<ErrorSection error={serverError} retry={vi.fn()} />);
    const heading = screen.getByRole('heading', { level: 1, name: 'This page didn’t load.' });
    expect(heading).toHaveFocus();
  });

  it('reports the error once', () => {
    render(<ErrorSection error={serverError} retry={vi.fn()} />);
    expect(report).toHaveBeenCalledExactlyOnceWith(serverError);
  });

  it('shows the digest as a reference, but never the error message', () => {
    render(<ErrorSection error={serverError} retry={vi.fn()} />);
    expect(screen.getByText('2938471')).toBeInTheDocument();
    expect(screen.queryByText(/Server Components render/)).not.toBeInTheDocument();
  });

  it('has no reference line for client errors', () => {
    render(<ErrorSection error={new Error('boom')} retry={vi.fn()} />);
    expect(screen.queryByText(/quote reference/)).not.toBeInTheDocument();
  });

  it('retries, and offers a way home', async () => {
    const retry = vi.fn();
    render(<ErrorSection error={serverError} retry={retry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
  });
});
