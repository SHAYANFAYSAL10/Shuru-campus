import { expect, test } from '@playwright/test';

import { amenitiesSeed, defaultBrand, plansSeed } from '@campus/contracts';

/** Tailwind's `md`: plan cards stop scrolling and the amenity bento replaces the marquee. */
const MD = 768;

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
    const photo = page.getByRole('img', { name: /^Placeholder photo: a sunlit/ });

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

  test('shows every plan, each linking to its page', async ({ page }) => {
    await page.goto('/');
    const plans = page.getByRole('list', { name: 'Plans' });

    await expect(plans.getByRole('heading', { level: 3 })).toHaveCount(plansSeed.length);
    await expect(plans.getByRole('link', { name: 'Hot Desk' })).toHaveAttribute(
      'href',
      '/spaces/hot-desk',
    );
    await expect(page.getByRole('link', { name: 'Compare all plans' })).toHaveAttribute(
      'href',
      '/spaces',
    );
  });

  test('pages through plans with the buttons on phones', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) >= MD, 'plans are a grid from md');
    await page.goto('/');
    const plans = page.getByRole('list', { name: 'Plans' });
    const previous = page.getByRole('button', { name: 'Previous plan' });
    const next = page.getByRole('button', { name: 'Next plan' });
    await plans.scrollIntoViewIfNeeded();

    await expect(previous).toBeDisabled();
    await next.click();
    await expect.poll(() => plans.evaluate((list) => list.scrollLeft)).toBeGreaterThan(0);
    await expect(previous).toBeEnabled();
  });

  test('lists the amenities: a bento from md, a marquee below', async ({ page }) => {
    await page.goto('/');
    const wide = (page.viewportSize()?.width ?? 0) >= MD;
    const amenities = page.getByRole('region', { name: 'Everything the day needs.' });
    const visible = amenities.getByRole('list', { name: 'Amenities' }).filter({ visible: true });

    // The region, not the list: on phones the marquee swaps its static list for the moving one
    // once hydrated.
    await amenities.scrollIntoViewIfNeeded();
    await expect(visible).toHaveCount(1);
    for (const amenity of amenitiesSeed) {
      await expect(visible.getByText(amenity.name, { exact: true })).toBeVisible();
    }
    await expect(amenities.getByRole('button', { name: 'Pause scrolling list' })).toHaveCount(
      wide ? 0 : 1,
    );
  });

  test('explains co-working with cited sources', async ({ page }) => {
    await page.goto('/');
    const why = page.getByRole('region', { name: 'Why share a workspace?' });

    await expect(why.getByRole('blockquote')).toHaveCount(2);
    await expect(why.getByRole('link', { name: /Investopedia/ })).toHaveAttribute(
      'target',
      '_blank',
    );
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
      await expect(page.getByRole('img', { name: /^Placeholder photo: a sunlit/ })).toBeVisible();
      for (const pillar of defaultBrand.pillars) {
        await expect(page.locator('p').filter({ hasText: `${pillar} your ` })).toBeVisible();
      }
      await expect(
        page.getByRole('list', { name: 'Plans' }).getByRole('heading', { level: 3 }).first(),
      ).toBeVisible();
      await expect(
        page.getByRole('list', { name: 'Amenities' }).filter({ visible: true }),
      ).toHaveCount(1);
      await expect(page.getByRole('blockquote').first()).toBeVisible();
      // The carousel buttons need JS, so they aren't there without it.
      await expect(page.getByRole('button', { name: 'Next plan' })).toHaveCount(0);
    });
  });
});
