import { expect, test } from '@playwright/test';

import { defaultBrand, plansSeed } from '@campus/contracts';

/** Tailwind's `lg`: the other plans stop scrolling and sit in a row of three. */
const LG = 1024;

// Plan detail smoke test (T5.5). The API serves the seed, so the facts are the seed's.

test.describe('Plan detail', () => {
  test('presents the plan, says where it sits and describes itself', async ({ page }) => {
    await page.goto('/spaces/meeting-room');
    const main = page.getByRole('main');

    await expect(page).toHaveTitle(`Meeting Room · ${defaultBrand.name}`);
    await expect(main.getByRole('heading', { level: 1 })).toHaveText('Meeting Room');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/spaces\/meeting-room$/,
    );

    const crumbs = main.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(crumbs.getByRole('link', { name: 'Spaces & pricing' })).toHaveAttribute(
      'href',
      '/spaces',
    );
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Meeting Room');

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.some((text) => text.includes('"BreadcrumbList"'))).toBe(true);
  });

  test('books a specific rate through the inquiry form', async ({ page }) => {
    await page.goto('/spaces/meeting-room');

    await expect(
      page.getByRole('link', { name: 'Book this: Meeting Room, Big, 10 people' }),
    ).toHaveAttribute('href', '/contact?plan=meeting-room&rate=big');
    await expect(page.getByRole('list', { name: 'Included with Meeting Room' })).toBeVisible();
  });

  test('suggests the plans nearest it and leads to their pages', async ({ page }) => {
    await page.goto('/spaces/hot-desk');
    const related = page.getByRole('region', { name: 'Need a different size?' });
    const cards = related.getByRole('list', { name: 'Other plans' });
    const wide = (page.viewportSize()?.width ?? 0) >= LG;

    await expect(cards.getByRole('heading', { level: 3 })).toHaveText([
      'Business Seating',
      'Executive Seating',
      'Private Office',
    ]);
    await expect(related.getByRole('button', { name: 'Next plan' })).toBeVisible({
      visible: !wide,
    });

    await cards.getByRole('link', { name: 'Business Seating' }).click();
    await expect(page).toHaveURL(/\/spaces\/business-seating$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Business Seating');
  });

  test('builds a page for every plan', async ({ request }) => {
    for (const plan of plansSeed) {
      const response = await request.get(`/spaces/${plan.slug}`);
      expect(response.status(), plan.slug).toBe(200);
    }
  });

  test('is a 404 for an unknown plan', async ({ page }) => {
    const response = await page.goto('/spaces/rooftop-pool');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      /This page hasn.t begun yet/,
    );
  });

  test('reaches a plan from its card on Home', async ({ page }) => {
    await page.goto('/');
    const card = page.getByRole('list', { name: 'Plans' }).getByRole('link', { name: 'Hot Desk' });
    await card.scrollIntoViewIfNeeded();
    await card.click();

    await expect(page).toHaveURL(/\/spaces\/hot-desk$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hot Desk');
  });
});
