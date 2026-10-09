import { expect, test } from '@playwright/test';

import { defaultBrand } from '@campus/contracts';

// About smoke test (T5.7). The API serves the seed brand and plans.

test.describe('About', () => {
  test('tells the story and describes itself', async ({ page }) => {
    await page.goto('/about');
    const main = page.getByRole('main');

    await expect(page).toHaveTitle(`About · ${defaultBrand.name}`);
    await expect(main.getByRole('heading', { level: 1 })).toHaveText('We are dreamers.');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/about$/);
    await expect(main.getByRole('img', { name: /Placeholder photo/ })).toBeVisible();
  });

  test('explains the name in its own language', async ({ page }) => {
    const meaning = defaultBrand.nameMeaning;
    test.skip(!meaning, 'The seed brand has no name meaning');
    if (!meaning) return;

    await page.goto('/about');
    const name = page.getByRole('heading', {
      level: 2,
      name: `${meaning.word} ${defaultBrand.shortName} is ${meaning.language} for ${meaning.meaning}.`,
    });
    await expect(name).toBeVisible();
    await expect(name.getByText(meaning.word, { exact: true })).toHaveAttribute(
      'lang',
      meaning.lang ?? '',
    );
  });

  test('lists the pillars and the ideas behind co-working', async ({ page }) => {
    await page.goto('/about');
    const pillars = page.getByRole('region', { name: 'What we stand for.' });
    await expect(pillars.getByRole('heading', { level: 3 })).toHaveText(defaultBrand.pillars);

    const why = page.getByRole('region', { name: 'Why share a workspace?' });
    await expect(why.getByRole('link', { name: /Investopedia/ })).toBeVisible();
  });

  test('leads each audience to the plan that fits it', async ({ page }) => {
    await page.goto('/about');
    const audiences = page.getByRole('region', { name: 'Room for every kind of work.' });
    await expect(audiences.getByRole('article')).toHaveCount(4);

    await audiences
      .getByRole('article', { name: 'Start-ups & small teams' })
      .getByRole('link', { name: 'See Private Office pricing' })
      .click();
    await expect(page).toHaveURL(/\/spaces\/private-office$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Private Office');
  });
});
