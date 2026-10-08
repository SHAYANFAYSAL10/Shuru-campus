import { expect, test } from '@playwright/test';

import { defaultBrand } from '@campus/contracts';

// Home smoke test (T5.1). The API serves the seed, so the brand and facts are the seed's.

test.describe('Home', () => {
  test('leads with the headline, the ways in and the facts', async ({ page }) => {
    await page.goto('/');
    const main = page.getByRole('main');

    await expect(page).toHaveTitle(`${defaultBrand.name} · ${defaultBrand.tagline}`);
    await expect(main.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Your startup begins here.',
    );
    await expect(main.getByRole('link', { name: 'Find your space' })).toHaveAttribute(
      'href',
      '/spaces',
    );
    await expect(main.getByRole('link', { name: 'Book a visit' })).toHaveAttribute(
      'href',
      '/contact',
    );

    const facts = main.getByRole('list', { name: 'At a glance' });
    await expect(facts.getByText(/^(Open now|Closed)/)).toBeVisible();
    await expect(facts).toContainText('From ৳100/hr');
    await expect(facts).toContainText('Sat–Thu 9:00–19:00');
  });

  test('loads the hero photo', async ({ page }) => {
    await page.goto('/');
    const photo = page.getByRole('img', { name: /^Placeholder photo/ });

    await expect(photo).toBeVisible();
    await expect
      .poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
  });

  test('states what each pillar means', async ({ page }) => {
    await page.goto('/');
    const manifesto = page.getByRole('region', { name: defaultBrand.pillars.join(', ') });

    for (const pillar of defaultBrand.pillars) {
      await manifesto.locator('p').filter({ hasText: pillar }).scrollIntoViewIfNeeded();
      await expect(manifesto.locator('p').filter({ hasText: `${pillar} your ` })).toBeVisible();
    }
  });

  test('describes itself to search engines and social cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /^Shared workspace & beyond, in the heart of Gulshan\. /,
    );
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(new URL(canonical ?? '').pathname).toBe('/');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      `${defaultBrand.name} · ${defaultBrand.tagline}`,
    );
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('shows every section', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('img', { name: /^Placeholder photo/ })).toBeVisible();
      for (const pillar of defaultBrand.pillars) {
        await expect(page.locator('p').filter({ hasText: `${pillar} your ` })).toBeVisible();
      }
    });
  });
});
