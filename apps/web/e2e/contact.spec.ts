import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';

import { defaultBrand, siteSeed } from '@campus/contracts';

// Contact (T5.6): docs/08-testing.md flows 1 (explore → inquire), 4 (contact validation) and
// 11 (no-JS). The API serves the seed and accepts inquiries without storing them.

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function fillRequired(page: Page) {
  const form = page.getByRole('form', { name: 'Send an inquiry' });
  await form.getByLabel('Name').fill('Nadia Rahman');
  await form.getByLabel('Email').fill('nadia@example.com');
  await form.getByLabel(/^Message/).fill('Looking for a meeting room on Monday morning.');
  return form;
}

async function expectNoAxeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = violations.map(
    (v) => `${v.id}: ${v.nodes.map((node) => node.target.join(' ')).join(', ')}`,
  );
  expect(summary).toEqual([]);
}

/** The form sends through a server action: a POST to the page itself. Drop those. */
const dropSends = (route: Route) =>
  route.request().method() === 'POST' ? route.abort('internetdisconnected') : route.fallback();

test.describe('Contact', () => {
  test('offers the form beside every other way in, and describes the business', async ({
    page,
  }) => {
    await page.goto('/contact');
    const main = page.getByRole('main');

    await expect(page).toHaveTitle(`Contact · ${defaultBrand.name}`);
    await expect(main.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Tell us how you work.',
    );
    await expect(main.getByRole('form', { name: 'Send an inquiry' })).toBeVisible();

    const aside = main.getByRole('complementary', { name: 'Rather talk?' });
    await expect(aside.getByRole('link', { name: /Open in Google Maps/ })).toHaveAttribute(
      'href',
      siteSeed.contact.mapUrl,
    );
    for (const phone of siteSeed.contact.phones) {
      await expect(aside.getByRole('link', { name: phone })).toHaveAttribute('href', /^tel:\+88/);
    }
    await expect(aside.getByRole('button', { name: 'Copy email address' })).toBeVisible();
    await expect(aside.getByText(/^(Open now|Closed) · /)).toBeVisible();

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.some((text) => text.includes('"LocalBusiness"'))).toBe(true);
  });

  test('takes a plan from "Book this" to a sent inquiry', async ({ page }) => {
    await page.goto('/spaces/meeting-room');
    await page.getByRole('link', { name: 'Book this: Meeting Room, Big, 10 people' }).click();

    await expect(page).toHaveURL(/\/contact\?plan=meeting-room&rate=big$/);
    const form = await fillRequired(page);
    await expect(form.getByLabel(/^Space/)).toHaveValue('meeting-room:big');
    await form.getByLabel(/^How many people/).fill('6');
    await form.getByRole('button', { name: 'Send inquiry' }).click();

    const thanks = page.getByRole('heading', { name: 'Thanks, Nadia Rahman.' });
    await expect(thanks).toBeFocused();
    // The form fades out as the thanks fade in.
    await expect(page.getByRole('form', { name: 'Send an inquiry' })).toHaveCount(0);
    await expect(page.getByText(/reply within one business day/)).toContainText(
      'nadia@example.com',
    );
    await expect(page.getByText('Meeting Room · Big, 10 people · ৳1,000/hour')).toBeVisible();
    await expect(page.getByText('6 people', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'Send another inquiry' }).click();
    const fresh = page.getByRole('form', { name: 'Send an inquiry' });
    await expect(fresh.getByLabel('Name')).toHaveValue('');
  });

  test('marks the errors and focuses the first, then sends once they are fixed', async ({
    page,
  }) => {
    await page.goto('/contact');
    const form = page.getByRole('form', { name: 'Send an inquiry' });

    await form.getByRole('button', { name: 'Send inquiry' }).click();
    await expect(form.getByLabel('Name')).toBeFocused();
    await expect(form.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByText('Enter a valid email address.')).toBeVisible();
    await expectNoAxeViolations(page);

    await fillRequired(page);
    await form.getByRole('button', { name: 'Send inquiry' }).click();
    await expect(page.getByRole('heading', { name: 'Thanks, Nadia Rahman.' })).toBeFocused();
  });

  test('keeps the inquiry and offers a retry when sending fails', async ({ page }) => {
    await page.goto('/contact');
    await page.route('**/contact', dropSends);

    const form = await fillRequired(page);
    await form.getByRole('button', { name: 'Send inquiry' }).click();

    await expect(form.getByText(/Check your connection and try again/)).toBeVisible();
    await expect(form.getByLabel('Name')).toHaveValue('Nadia Rahman');
    await expectNoAxeViolations(page);

    await page.unroute('**/contact', dropSends);
    await form.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('heading', { name: 'Thanks, Nadia Rahman.' })).toBeFocused();
    await expect(form).toHaveCount(0);
    await expectNoAxeViolations(page);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('checks the form on the server and sends it', async ({ page }) => {
      await page.goto('/contact?plan=hot-desk');
      const form = page.getByRole('form', { name: 'Send an inquiry' });
      await expect(form.getByLabel(/^Space/)).toHaveValue('hot-desk');

      await form.getByLabel('Email').fill('nadia@');
      await form.getByRole('button', { name: 'Send inquiry' }).click();

      await expect(form.getByText('Name needs at least 2 characters.')).toBeVisible();
      await expect(form.getByLabel('Name')).toBeFocused();
      await expect(form.getByLabel('Email')).toHaveValue('nadia@');
      await expect(form.getByLabel(/^Space/)).toHaveValue('hot-desk');

      await fillRequired(page);
      await form.getByRole('button', { name: 'Send inquiry' }).click();

      await expect(page.getByRole('heading', { name: 'Thanks, Nadia Rahman.' })).toBeVisible();
      await expect(page.getByText('Hot Desk', { exact: true })).toBeVisible();
    });
  });
});
