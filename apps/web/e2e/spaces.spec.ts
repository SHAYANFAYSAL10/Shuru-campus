import { expect, test } from '@playwright/test';

import { defaultBrand, plansSeed } from '@campus/contracts';

/** Tailwind's `lg`: the comparison is a table from here, cards below. */
const LG = 1024;

// Spaces & pricing smoke test (T5.4). The API serves the seed, so the facts are the seed's.

test.describe('Spaces', () => {
  test('introduces the plans and describes itself', async ({ page }) => {
    await page.goto('/spaces');

    await expect(page).toHaveTitle(`Spaces & pricing · ${defaultBrand.name}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pay for the space you use.');
    for (const plan of plansSeed) {
      await expect(page.getByRole('region', { name: plan.name, exact: true })).toBeAttached();
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/spaces$/);
  });

  test('filters by period, keeps the URL in step and goes back to every plan', async ({ page }) => {
    await page.goto('/spaces');
    const hotDesk = page.getByRole('region', { name: 'Hot Desk', exact: true });
    const filter = page.getByRole('group', { name: 'How would you like to pay?' });

    await filter
      .locator('label')
      .filter({ hasText: /^Monthly$/ })
      .click();

    await expect(page).toHaveURL(/\?period=monthly$/);
    await expect(page.getByText('Showing the 3 plans you can book by the month.')).toBeVisible();
    await expect(hotDesk).toBeHidden();
    const business = page.getByRole('region', { name: 'Business Seating', exact: true });
    await expect(business).toBeVisible();
    await expect(business.locator('[data-rate-period="monthly"] [data-rate-mark]')).toBeVisible();

    await page.getByRole('link', { name: 'Show all plans' }).click();
    await expect(page).toHaveURL(/\/spaces$/);
    await expect(hotDesk).toBeVisible();
  });

  test('arrives filtered from a shared link', async ({ page }) => {
    await page.goto('/spaces?period=weekly');

    await expect(page.getByRole('radio', { name: 'Weekly' })).toBeChecked();
    await expect(page.getByRole('region', { name: 'Seminar Room', exact: true })).toBeHidden();
    await expect(
      page.getByRole('region', { name: 'Executive Seating', exact: true }),
    ).toBeVisible();
  });

  test('books a specific rate through the inquiry form', async ({ page }) => {
    await page.goto('/spaces');
    const room = page.getByRole('region', { name: 'Meeting Room', exact: true });

    await expect(
      room.getByRole('link', { name: 'Book this: Meeting Room, Big, 10 people' }),
    ).toHaveAttribute('href', '/contact?plan=meeting-room&rate=big');
  });

  test('jumps to a plan from the links under the filter', async ({ page }) => {
    await page.goto('/spaces');
    await page
      .getByRole('navigation', { name: 'Plans on this page' })
      .getByRole('link', { name: 'Seminar Room' })
      .click();

    await expect(page).toHaveURL(/#seminar-room$/);
    // On short screens the plan's photo comes first, so check the section, not its heading.
    await expect(page.getByRole('region', { name: 'Seminar Room', exact: true })).toBeInViewport();
  });

  test('compares plans as a table on wide screens and cards on narrow ones', async ({ page }) => {
    await page.goto('/spaces');
    const table = page.getByRole('table', { name: /^Plans compared/ });
    const cards = page.getByRole('list', { name: 'Plans compared' });
    const wide = (page.viewportSize()?.width ?? 0) >= LG;

    await (wide ? expect(table) : expect(cards)).toBeVisible();
    await (wide ? expect(cards) : expect(table)).toBeHidden();
    if (wide) {
      await expect(table.getByRole('columnheader')).toHaveCount(plansSeed.length + 1);
    } else {
      await expect(cards.getByRole('heading', { level: 3 })).toHaveCount(plansSeed.length);
    }
  });

  test('answers questions in an accordion that opens one at a time by keyboard', async ({
    page,
  }) => {
    await page.goto('/spaces');
    const faq = page.getByRole('region', { name: 'Good to know.' });
    const refunds = faq.locator('details#refunds');
    const hours = faq.locator('details#opening-hours');

    await refunds.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(refunds).toHaveAttribute('open');
    await expect(faq.getByRole('link', { name: 'Read the refund policy' })).toBeVisible();

    await hours.locator('summary').focus();
    await page.keyboard.press('Space');
    await expect(hours).toHaveAttribute('open');
    await expect(hours).toContainText('Saturday to Thursday, 9:00–19:00');
    await expect(refunds).not.toHaveAttribute('open');
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('shows every plan and filters through the form', async ({ page }) => {
      await page.goto('/spaces');
      await expect(page.getByRole('region', { name: 'Hot Desk', exact: true })).toBeVisible();

      await page
        .getByRole('group', { name: 'How would you like to pay?' })
        .locator('label')
        .filter({ hasText: /^Daily$/ })
        .click();
      await page.getByRole('button', { name: 'Show plans' }).click();

      await expect(page).toHaveURL(/\?period=daily#pricing$/);
      await expect(page.getByText('Showing the one plan you can book by the day.')).toBeVisible();
      await expect(page.getByRole('region', { name: 'Meeting Room', exact: true })).toBeHidden();
    });
  });
});
