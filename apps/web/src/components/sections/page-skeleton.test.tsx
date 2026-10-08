import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageSkeleton } from '@/components/sections/page-skeleton';

describe('PageSkeleton', () => {
  it('is announced once as a busy status', () => {
    render(<PageSkeleton />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent(/^Loading page$/);
  });
});
