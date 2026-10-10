import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { defaultBrand, gallerySeed } from '@campus/contracts';

import { auditLayout, settleAnimations } from './page-checks';

// Gallery (T5.8) and its lightbox (T6.6). The API serves the seed photos.

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

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

  test('opens the lightbox from the keyboard, steps with the arrows and closes back to the photo', async ({
    page,
  }) => {
    await page.goto('/gallery?category=meeting');
    const photos = page.getByRole('region', { name: 'Photos' });
    const first = photos.getByRole('link').first();

    await first.focus();
    await page.keyboard.press('Enter');
    const viewer = page.getByRole('dialog', { name: 'Photo viewer' });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText(/^Photo 1 of 3:/)).toBeAttached();
    await expect(viewer.getByText('1 / 3')).toBeVisible();
    await expect(viewer.getByRole('button', { name: 'Close photo viewer' })).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(viewer.getByText(/^Photo 2 of 3:/)).toBeAttached();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(viewer.getByText(/^Photo 3 of 3:/)).toBeAttached();

    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
    await expect(photos.getByRole('link').last()).toBeFocused();
    await expect(page).toHaveURL(/\?category=meeting$/);
  });

  test('swipes to the next photo and closes on a tap beside it', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByRole('region', { name: 'Photos' }).getByRole('link').first().click();
    const viewer = page.getByRole('dialog', { name: 'Photo viewer' });
    await expect(viewer.getByText(/^Photo 1 of/)).toBeAttached();

    const photo = viewer.locator('[data-lightbox-photo]');
    await expect(photo).toBeVisible();
    // Let the zoom land before measuring the photo.
    await page.waitForFunction(
      () => document.querySelector('[data-lightbox-photo]')?.getAnimations().length === 0,
    );
    const box = await photo.boundingBox();
    if (!box) throw new Error('The photo has no box');
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.8, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, y, { steps: 10 });
    await page.mouse.up();
    await expect(viewer.getByText(/^Photo 2 of/)).toBeAttached();
    // The first photo has slid away.
    await expect(photo).toHaveCount(1);

    // The stage's corner: the photo fits inside it, so the corner is always backdrop.
    await photo.locator('..').click({ position: { x: 1, y: 1 } });
    await expect(viewer).toBeHidden();
  });

  test('the open lightbox passes axe and fits the screen, in both themes', async ({ page }) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      await page.goto('/gallery');
      await page.getByRole('region', { name: 'Photos' }).getByRole('link').first().click();
      await expect(page.getByRole('dialog', { name: 'Photo viewer' })).toBeVisible();
      await settleAnimations(page);

      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(violations.map((v) => `${colorScheme} ${v.id}`)).toEqual([]);
      const audit = await auditLayout(page);
      expect(audit.overflow, colorScheme).toBe(0);
      expect([...audit.escaping, ...audit.clipped, ...audit.smallTargets], colorScheme).toEqual([]);
    }
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('opens without zooming from the thumbnail', async ({ page }) => {
      await page.goto('/gallery');
      await page.getByRole('region', { name: 'Photos' }).getByRole('link').first().click();
      const photo = page.getByRole('dialog').locator('[data-lightbox-photo]');
      await expect(photo).toBeVisible();
      expect(
        await photo.evaluate((el) =>
          el.getAnimations().some((animation) => {
            const keyframes = (animation.effect as KeyframeEffect | null)?.getKeyframes() ?? [];
            return keyframes.some((frame) => String(frame.transform ?? 'none') !== 'none');
          }),
        ),
      ).toBe(false);
    });
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('links each photo to its full-size file', async ({ page }) => {
      await page.goto('/gallery');
      const link = page.getByRole('region', { name: 'Photos' }).getByRole('link').first();
      await expect(link).toHaveAttribute('href', gallerySeed[0]?.src ?? '');
      await expect(link).not.toHaveAttribute('aria-haspopup');
    });
  });

  test.describe('without JavaScript (filters)', () => {
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
