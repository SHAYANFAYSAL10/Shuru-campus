import { expect, test } from '@playwright/test';

// Member login (docs/05-pages-and-interactions.md): the member portal isn't built yet, so its
// links stay on the site and land on the 404 page instead of an external portal.

test.describe('Member login', () => {
  test('stays on the site and lands on the 404 page', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('contentinfo').getByRole('link', { name: 'Member login' });
    await expect(link).toHaveAttribute('href', '/members/login');

    const response = await page.request.get('/members/login');
    expect(response.status()).toBe(404);

    await link.click();
    await expect(page).toHaveURL(/\/members\/login$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      /This page hasn.t begun yet/,
    );
  });
});
