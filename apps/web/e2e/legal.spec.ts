import { expect, test } from '@playwright/test';

import { defaultBrand } from '@campus/contracts';

/** Tailwind's `lg`: the contents stick beside the text from here, a disclosure below. */
const LG = 1024;

// Legal pages smoke test (T5.8): verbatim policies with the company name from config.

const PAGES = [
  { path: '/legal/privacy', title: 'Privacy Policy' },
  { path: '/legal/terms', title: 'Terms & Conditions' },
  { path: '/legal/refund', title: 'Refund Policy' },
] as const;

test.describe('Legal', () => {
  for (const { path, title } of PAGES) {
    test(`${title} describes itself and names the company`, async ({ page }) => {
      await page.goto(path);
      const main = page.getByRole('main');

      await expect(page).toHaveTitle(`${title} · ${defaultBrand.name}`);
      await expect(main.getByRole('heading', { level: 1 })).toHaveText(title);
      await expect(main.getByText(/^Last updated \d{1,2} \w+ \d{4}$/)).toBeVisible();
      await expect(
        main.getByRole('article').getByText(defaultBrand.legalName).first(),
      ).toBeVisible();
      await expect(
        main
          .getByRole('navigation', { name: 'Legal documents' })
          .getByRole('link', { name: title }),
      ).toHaveAttribute('aria-current', 'page');
    });
  }

  test('moves between policies', async ({ page }) => {
    await page.goto('/legal/privacy');
    await page
      .getByRole('navigation', { name: 'Legal documents' })
      .getByRole('link', { name: 'Refund Policy' })
      .click();
    await expect(page).toHaveURL(/\/legal\/refund$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Refund Policy');
  });

  test('lists the sections and follows the reader through them', async ({ page }) => {
    await page.goto('/legal/terms');
    const wide = (page.viewportSize()?.width ?? 0) >= LG;
    if (!wide) await page.locator('summary', { hasText: 'On this page' }).click();
    const contents = page.getByRole('navigation', { name: 'On this page' });

    await expect(contents.getByRole('link')).toHaveCount(6);
    await contents.getByRole('link', { name: 'Fees' }).click();
    await expect(page).toHaveURL(/#fees$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Fees' })).toBeInViewport();
    if (wide) {
      await expect(contents.getByRole('link', { name: 'Fees' })).toHaveAttribute(
        'aria-current',
        'location',
      );
    }
  });

  test('has no contents when there is only one part', async ({ page }) => {
    await page.goto('/legal/privacy');
    await expect(page.getByRole('navigation', { name: 'On this page' })).toHaveCount(0);
  });

  test('prints the policy without the site around it', async ({ page }) => {
    await page.goto('/legal/terms');
    await page.emulateMedia({ media: 'print' });

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-site-header]')).toBeHidden();
    await expect(page.locator('footer').last()).toBeHidden();
    await expect(page.getByRole('navigation', { name: 'Legal documents' })).toBeHidden();
    // Polled: the theme's background cross-fade (A7) runs into the print colors too.
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor))
      .toBe('rgb(255, 255, 255)');
  });

  test('is a 404 for an unknown policy', async ({ page }) => {
    const response = await page.goto('/legal/cookies');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      /This page hasn.t begun yet/,
    );
  });
});
