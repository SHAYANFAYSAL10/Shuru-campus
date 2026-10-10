import { expect, test } from '@playwright/test';

import { amenitiesSeed, defaultBrand, plansSeed, siteSeed } from '@campus/contracts';

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

  test('changes the word after "Your", until the pause button stops it', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByRole('heading', { level: 1 });
    // The words are decoration (screen readers get the sentence), so there's no accessible handle.
    const word = heading.locator('[data-word-slot="current"]');
    const pause = page.getByRole('button', { name: 'Pause changing word' });
    // A word's turn (`wordCycle.interval`) with room to spare.
    const turn = { timeout: 6000 };

    await expect(word).toHaveText('startup');
    await expect(word).toHaveText('big idea', turn);
    await expect(heading).toHaveAccessibleName('Your startup begins here.');

    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'true');
    // Off the button too, so only the pause holds it.
    await page.keyboard.press('Tab');
    await page.mouse.move(0, 0);
    const held = (await word.textContent()) ?? '';
    await page.waitForTimeout(4000);
    await expect(word).toHaveText(held);

    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'false');
    await expect(word).not.toHaveText(held, turn);
  });

  test('hands the begin line off to the nav underline', async ({ page }) => {
    await page.goto('/');
    test.skip(!(await page.getByRole('navigation', { name: 'Main' }).isVisible()), 'nav from lg');

    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Spaces' })
      .click();
    await page.waitForURL('**/spaces');
    const underline = page.locator('nav[aria-label="Main"] [aria-current] .origin-top-left');
    // It arrives flying (a running transform animation), then rests in place.
    expect(await underline.evaluate((el) => el.getAnimations().length)).toBe(1);
    await expect.poll(() => underline.evaluate((el) => el.getAnimations().length)).toBe(0);
    await expect(underline).toBeVisible();
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

  test('suggests a plan from three answers and books it', async ({ page }) => {
    await page.goto('/');
    const finder = page.getByRole('region', { name: 'Not sure which one?' });
    const result = finder.getByRole('region', { name: 'Your match' });
    const question = (name: string) => finder.getByRole('group', { name });
    await finder.scrollIntoViewIfNeeded();
    await expect(result).toContainText('0 of 3 answered');

    // Pointer for the first two, keyboard for the last: Tab into the group, arrows to choose.
    await question('Who’s working?').getByText('Just me').click();
    await question('How often?').getByText('Monthly').click();
    await expect(result).toContainText('2 of 3 answered');
    await page.keyboard.press('Tab');
    await expect(question('What do you need?').getByRole('radio', { name: 'Desk' })).toBeFocused();
    await page.keyboard.press('ArrowRight');

    await expect(result.getByRole('heading', { name: 'Executive Seating' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Suggested plan' })).toHaveText(
      'Suggested plan: Executive Seating, 14,000 taka per month.',
    );

    // Another answer swaps the suggestion in place.
    await question('Who’s working?').getByText('2–6 people').click();
    await expect(result.getByRole('heading', { name: 'Private Office' })).toBeVisible();
    await expect(result).toContainText('From');

    await question('Who’s working?').getByText('Just me').click();
    await result.getByRole('link', { name: 'Book Executive Seating' }).click();
    await expect(page).toHaveURL('/contact?plan=executive-seating&rate=monthly');
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

  test('the amenity marquee drifts, can be scrolled by hand and pauses on phones', async ({
    page,
  }) => {
    await page.goto('/');
    test.skip((page.viewportSize()?.width ?? 0) >= MD, 'The marquee is phones only.');
    const amenities = page.getByRole('region', { name: 'Everything the day needs.' });
    await amenities.scrollIntoViewIfNeeded();
    const viewport = amenities.getByTestId('marquee-viewport');
    const scrolled = () => viewport.evaluate((el) => el.scrollLeft);
    const pause = amenities.getByRole('button', { name: 'Pause scrolling list' });

    // It drifts on its own.
    const start = await expect.poll(scrolled).toBeGreaterThan(0).then(scrolled);
    await expect.poll(scrolled).toBeGreaterThan(start + 10);

    // Paused, it stays put, even with focus left on the button...
    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'true');
    const held = await scrolled();
    await page.waitForTimeout(500);
    expect(Math.abs((await scrolled()) - held)).toBeLessThan(1);

    // ...but can still be scrolled by hand to reach every item.
    await viewport.hover();
    await page.mouse.wheel(300, 0);
    await expect.poll(scrolled).toBeGreaterThan(held + 200);

    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'false');
    const resumed = await scrolled();
    await expect.poll(scrolled).toBeGreaterThan(resumed + 10);
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

  test('shows how to visit: map, address, hours with today marked, phones and email', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    const visit = page.getByRole('region', { name: 'Come and see it for yourself.' });
    await visit.scrollIntoViewIfNeeded();

    await expect(visit.getByRole('link', { name: 'Open in Google Maps' })).toHaveAttribute(
      'href',
      siteSeed.contact.mapUrl,
    );
    await expect(visit.locator('address')).toContainText(siteSeed.contact.addressLines[0] ?? '');

    const table = visit.getByRole('table', { name: 'Opening hours, Dhaka time' });
    await expect(table.getByRole('row')).toHaveCount(8);
    // Exactly one day is today, marked in words once hydrated.
    await expect(table.getByRole('row').filter({ hasText: 'Today' })).toHaveCount(1);

    await expect(visit.getByRole('link', { name: '+88 09666-731731' })).toHaveAttribute(
      'href',
      'tel:+8809666731731',
    );

    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => undefined);
    await visit.getByRole('button', { name: 'Copy email address' }).click();
    await expect(page.getByText('Email address copied', { exact: true })).toBeVisible();
  });

  test('ends with an inquiry call to action', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('region', { name: 'Ready when you are.' });

    await expect(cta.getByRole('link', { name: 'Send an inquiry' })).toHaveAttribute(
      'href',
      '/contact',
    );
    await expect(cta.getByRole('link', { name: '+88 09666-731731' })).toBeVisible();
  });

  test('describes the business as structured data', async ({ page }) => {
    await page.goto('/');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? '{}') as Record<string, unknown>;

    expect(data['@type']).toBe('LocalBusiness');
    expect(data.name).toBe(defaultBrand.name);
    expect(data.telephone).toBe(siteSeed.contact.phones[0]);
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
      // The first word stays; the pause button keeps its place but isn't offered.
      await expect(page.locator('[data-word-slot="current"]')).toHaveText('startup');
      await expect(page.getByRole('button', { name: 'Pause changing word' })).toHaveCount(0);
      await expect(page.getByRole('img', { name: /^Placeholder photo: a sunlit/ })).toBeVisible();
      for (const pillar of defaultBrand.pillars) {
        await expect(page.locator('p').filter({ hasText: `${pillar} your ` })).toBeVisible();
      }
      await expect(
        page.getByRole('list', { name: 'Plans' }).getByRole('heading', { level: 3 }).first(),
      ).toBeVisible();
      // The finder's questions are there; its card points to every plan instead.
      await expect(page.getByRole('group', { name: 'Who’s working?' })).toBeVisible();
      // Playwright's text queries skip `<noscript>`, even with JS off, so this finds it by tag.
      await expect(page.locator('noscript > p')).toContainText('Suggestions need JavaScript.');
      await expect(page.locator('noscript > p')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Or compare every plan' })).toBeVisible();
      await expect(
        page.getByRole('list', { name: 'Amenities' }).filter({ visible: true }),
      ).toHaveCount(1);
      await expect(page.getByRole('blockquote').first()).toBeVisible();
      // The hours are all there; only the today marker waits for JS.
      await expect(
        page.getByRole('table', { name: 'Opening hours, Dhaka time' }).getByRole('row'),
      ).toHaveCount(8);
      await expect(page.getByRole('link', { name: 'Send an inquiry' })).toBeVisible();
      // The carousel buttons need JS, so they aren't there without it.
      await expect(page.getByRole('button', { name: 'Next plan' })).toHaveCount(0);
    });
  });
});
