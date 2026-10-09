import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { gallerySeed, type GalleryCategory } from '@campus/contracts';

import { GalleryBrowser } from '@/components/gallery/gallery-browser';

const withoutEvents = gallerySeed.filter((image) => image.category !== 'events');

function renderGallery(initialCategory?: GalleryCategory, images = gallerySeed) {
  return render(
    <GalleryBrowser images={images} initialCategory={initialCategory} action="/gallery#photos" />,
  );
}

const chip = (name: string) => screen.getByRole('button', { name });
const photos = () => within(screen.getByRole('list')).getAllByRole('img');

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('GalleryBrowser', () => {
  it('shows every photo with "All" chosen at first', () => {
    renderGallery();
    const group = screen.getByRole('group', { name: 'Show photos of' });
    expect(
      within(group)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['All', 'Workspace', 'Meeting rooms', 'Café', 'Events']);
    expect(chip('All')).toHaveAttribute('aria-pressed', 'true');
    expect(photos()).toHaveLength(gallerySeed.length);
    expect(screen.getByText(`Showing all ${String(gallerySeed.length)} photos.`)).toBeVisible();
  });

  it('starts from the category in the URL', () => {
    renderGallery('cafe');
    expect(chip('Café')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('All')).toHaveAttribute('aria-pressed', 'false');
    expect(photos().map((img) => img.getAttribute('alt'))).toEqual([
      'Placeholder photo: a barista at the café counter',
      'Placeholder photo: iced coffees in a sofa corner',
    ]);
  });

  it('filters in place, keeps the URL in step and says what it shows', async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.click(chip('Meeting rooms'));
    expect(chip('Meeting rooms')).toHaveAttribute('aria-pressed', 'true');
    expect(window.location.search).toBe('?category=meeting');
    expect(screen.getByText('Showing 3 photos of the meeting rooms.')).toHaveAttribute(
      'aria-live',
      'polite',
    );

    await user.click(chip('All'));
    expect(window.location.search).toBe('');
    expect(screen.getByText(`Showing all ${String(gallerySeed.length)} photos.`)).toBeVisible();
  });

  it('works as a form without JS: each chip submits its category', () => {
    renderGallery();
    const form = chip('All').closest('form');
    expect(form).toHaveAttribute('method', 'get');
    expect(form).toHaveAttribute('action', '/gallery#photos');
    expect(chip('Events')).toHaveAttribute('type', 'submit');
    expect(chip('Events')).toHaveAttribute('name', 'category');
    expect(chip('Events')).toHaveAttribute('value', 'events');
    // "All" sends no category at all.
    expect(chip('All')).not.toHaveAttribute('name');
  });

  it('suggests another category when one is empty, and hands focus to its chip', async () => {
    const user = userEvent.setup();
    renderGallery('events', withoutEvents);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Nothing in/)[0]).toHaveTextContent('Nothing in Events yet.');
    expect(screen.getByText(/Try/)).toHaveTextContent('Nothing in Events yet. Try Workspace.');

    await user.click(screen.getByRole('button', { name: 'Show Workspace' }));
    expect(chip('Workspace')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Workspace')).toHaveFocus();
    expect(photos()).toHaveLength(3);
  });

  it('offers every photo when no other category has any', async () => {
    const user = userEvent.setup();
    renderGallery('cafe', []);

    await user.click(screen.getByRole('button', { name: 'Show all photos' }));
    expect(chip('All')).toHaveFocus();
    expect(window.location.search).toBe('');
  });

  it('loads the first photos straight away and the rest lazily', () => {
    renderGallery();
    const imgs = photos();
    expect(imgs[0]).toHaveAttribute('loading', 'eager');
    expect(imgs[0]).toHaveAttribute('fetchpriority', 'high');
    expect(imgs.at(-1)).toHaveAttribute('loading', 'lazy');
  });
});
