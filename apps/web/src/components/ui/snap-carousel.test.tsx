import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NextLink from 'next/link';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SnapCarousel } from '@/components/ui/snap-carousel';
import { MEDIA } from '@/lib/hooks/use-media-query';
import { setMediaQuery } from '@/test/media';

// jsdom has no layout: the list's scroll metrics and the first item's width are stubbed.
const metrics = { scrollLeft: 0, clientWidth: 300, scrollWidth: 1000 };
const ITEM_WIDTH = 240;
const scrollBy = vi.fn();

function stubLayout() {
  vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockImplementation(() => metrics.scrollLeft);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
    () => metrics.clientWidth,
  );
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(
    () => metrics.scrollWidth,
  );
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: ITEM_WIDTH,
  } as DOMRect);
  HTMLElement.prototype.scrollBy = scrollBy;
}

function renderCarousel() {
  return render(
    <SnapCarousel
      label="Plans"
      itemName="plan"
      aside={<NextLink href="/spaces">Compare all plans</NextLink>}
    >
      <li>Hot Desk</li>
      <li>Business Seating</li>
      <li>Private Office</li>
    </SnapCarousel>,
  );
}

/** Moves the list and lets the carousel read its edges (it waits a frame). */
async function scrollTo(list: HTMLElement, left: number) {
  metrics.scrollLeft = left;
  fireEvent.scroll(list);
  await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
}

describe('SnapCarousel', () => {
  beforeEach(() => {
    metrics.scrollLeft = 0;
    stubLayout();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    scrollBy.mockReset();
  });

  it('is a plain scrolling list without JS: no buttons that would do nothing', () => {
    const html = renderToString(
      <SnapCarousel label="Plans" itemName="plan" aside="Compare all plans">
        <li>Hot Desk</li>
      </SnapCarousel>,
    );
    expect(html).toContain('aria-label="Plans"');
    expect(html).toContain('snap-x');
    expect(html).toContain('Compare all plans');
    expect(html).not.toContain('<button');
  });

  it('names the list and points both buttons at it', async () => {
    renderCarousel();
    const list = screen.getByRole('list', { name: 'Plans' });
    const next = await screen.findByRole('button', { name: 'Next plan' });
    expect(next).toHaveAttribute('aria-controls', list.id);
    expect(screen.getByRole('button', { name: 'Previous plan' })).toHaveAttribute(
      'aria-controls',
      list.id,
    );
    expect(screen.getByRole('link', { name: 'Compare all plans' })).toBeInTheDocument();
  });

  it('starts with Previous disabled and moves one item (plus the gap) per click', async () => {
    const user = userEvent.setup();
    renderCarousel();
    const next = await screen.findByRole('button', { name: 'Next plan' });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Previous plan' })).toBeDisabled();
    });

    await user.click(next);
    // The gap is 0 here: jsdom computes no styles from class names.
    expect(scrollBy).toHaveBeenCalledWith({ left: ITEM_WIDTH, behavior: 'smooth' });
  });

  it('jumps instead of gliding under reduced motion', async () => {
    setMediaQuery(MEDIA.reducedMotion, true);
    const user = userEvent.setup();
    renderCarousel();
    await user.click(await screen.findByRole('button', { name: 'Next plan' }));
    expect(scrollBy).toHaveBeenCalledWith({ left: ITEM_WIDTH, behavior: 'instant' });
  });

  it('disables Next at the end and hands focus to Previous', async () => {
    renderCarousel();
    const list = screen.getByRole('list', { name: 'Plans' });
    const next = await screen.findByRole('button', { name: 'Next plan' });
    next.focus();

    await scrollTo(list, metrics.scrollWidth - metrics.clientWidth);
    expect(screen.getByRole('button', { name: 'Next plan' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous plan' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Previous plan' })).toHaveFocus();
  });
});
