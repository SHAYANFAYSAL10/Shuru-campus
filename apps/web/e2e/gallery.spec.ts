import { expect, test } from '@playwright/test';

import { defaultBrand, gallerySeed } from '@campus/contracts';

// Gallery smoke test (T5.8). The API serves the seed photos; the lightbox arrives in T6.6.

const count = (category: string) =>
  gallerySeed.filter((image) => image.category === category).length;

test.describe('Gallery', () => {
  test('shows every photo and describes itself', async ({ page }) => {
    await page.goto('/gallery');
    const photos = page.getByRole('region', { name: 'Photos' });

    await expect(page).toHaveTitle(`Gallery · ${defaultBrand.name}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Take a look around.');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/gallery$/);
    await expect(photos.getByRole('listitem')).toHaveCount(gallerySeed.length);
    await expect(photos.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('filters by category, keeps the URL in step and goes back to every photo', async ({
    page,
  }) => {
    await page.goto('/gallery');
    const photos = page.getByRole('region', { name: 'Photos' });

    await photos.getByRole('button', { name: 'Café' }).click();
    await expect(page).toHaveURL(/\?category=cafe$/);
    await expect(
      page.getByText(`Showing ${String(count('cafe'))} photos of the café.`),
    ).toBeVisible();
    await expect(photos.getByRole('listitem')).toHaveCount(count('cafe'));
    await expect(photos.getByRole('img', { name: /the café counter/ })).toBeVisible();

    await photos.getByRole('button', { name: 'All' }).click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(photos.getByRole('listitem')).toHaveCount(gallerySeed.length);
  });

  test('arrives filtered from a shared link', async ({ page }) => {
    await page.goto('/gallery?category=events');
    const photos = page.getByRole('region', { name: 'Photos' });

    await expect(photos.getByRole('button', { name: 'Events' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(photos.getByRole('listitem')).toHaveCount(count('events'));
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('filters with the chips as a form', async ({ page }) => {
      await page.goto('/gallery');
      const photos = page.getByRole('region', { name: 'Photos' });

      await photos.getByRole('button', { name: 'Meeting rooms' }).click();
      await expect(page).toHaveURL(/\/gallery\?category=meeting#photos$/);
      await expect(photos.getByRole('listitem')).toHaveCount(count('meeting'));
      await expect(photos.getByRole('img').first()).toBeVisible();
    });
  });
});
