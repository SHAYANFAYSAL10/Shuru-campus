import { type Locator, type Page, expect, test } from '@playwright/test';

import { defaultBrand } from '@campus/contracts';

import { settleAnimations } from './page-checks';

// T6.7: the small things (04 §6, 10 A6/B3). Hover effects only on fine pointers, so every check
// runs on the whole matrix and expects the effect exactly where a mouse is the pointer.

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
/** Tailwind's `md`: the amenity bento replaces the marquee. */
const MD = 768;
/** Must match `scrollText.dim` (styles/motion.ts). */
const DIM = 0.62;

const finePointer = (page: Page) =>
  page.evaluate((query) => window.matchMedia(query).matches, FINE_POINTER);

/** Hovers, then waits for the transitions it starts. */
async function hoverAndSettle(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded();
  await target.hover();
  await settleAnimations(page);
}

test.describe('Micro-interactions', () => {
  test('applies every hover style on fine pointers only', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'laptop', 'A property of the stylesheet, not the screen');
    await page.goto('/');

    const ungated = await page.evaluate((query) => {
      const found: string[] = [];
      const gated = (rule: CSSRule) => {
        for (let parent = rule.parentRule; parent; parent = parent.parentRule) {
          if (parent instanceof CSSMediaRule && parent.conditionText.includes(query)) return true;
        }
        return false;
      };
      const walk = (rules: CSSRuleList) => {
        for (const rule of rules) {
          if (rule instanceof CSSStyleRule && rule.selectorText.includes(':hover') && !gated(rule))
            found.push(rule.selectorText);
          if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules);
        }
      };
      for (const sheet of document.styleSheets) walk(sheet.cssRules);
      return found;
    }, FINE_POINTER);

    expect(ungated).toEqual([]);
  });

  test('lifts a plan card under the mouse', async ({ page }) => {
    await page.goto('/');
    const card = page
      .getByRole('main')
      .getByRole('link', { name: 'Hot Desk', exact: true })
      .first()
      .locator('xpath=ancestor::li[1]');

    await hoverAndSettle(page, card);
    const translate = await card.evaluate((element) => getComputedStyle(element).translate);
    expect(translate).toBe((await finePointer(page)) ? '0px -4px' : 'none');
  });

  test('nudges an amenity icon up under the mouse', async ({ page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) < MD,
      'The bento is from md; phones get the marquee',
    );
    await page.goto('/');
    // The marquee shares the name but is hidden from md, so the bento is the only visible one.
    const tile = page.getByRole('list', { name: 'Amenities' }).getByRole('listitem').nth(1);

    await hoverAndSettle(page, tile);
    const nudge = await tile
      .locator('svg')
      .first()
      .evaluate((icon) => getComputedStyle(icon).translate);
    expect(nudge).toBe((await finePointer(page)) ? '0px -2px' : 'none');
  });

  test('draws the begin line under a standalone link under the mouse', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Compare all plans' });

    await hoverAndSettle(page, link);
    const line = await link.evaluate((element) => getComputedStyle(element, '::after').transform);
    // scaleX(1) is the identity matrix; undrawn is scaleX(0).
    expect(line).toBe(
      (await finePointer(page)) ? 'matrix(1, 0, 0, 1, 0, 0)' : 'matrix(0, 0, 0, 1, 0, 0)',
    );
  });

  test('pulls the inquiry button toward the mouse, at most 6px', async ({ page }) => {
    await page.goto('/');
    const button = page
      .getByRole('region', { name: 'Ready when you are.' })
      .getByRole('link', { name: 'Send an inquiry' });
    const fine = await finePointer(page);
    // The pull only follows the mouse once hydrated.
    await expect(button.locator('xpath=..')).toHaveAttribute('data-magnetic', fine ? 'on' : 'off');
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox();
    if (!box) throw new Error('No inquiry button');

    // Into its bottom-right corner: the furthest pull there is, diagonally.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.move(box.x + box.width - 2, box.y + box.height - 2, { steps: 4 });
    const pull = () =>
      button.evaluate((element) => {
        const magnetic = element.closest('[data-magnetic]');
        if (!magnetic) return Number.NaN;
        const { m41, m42 } = new DOMMatrix(getComputedStyle(magnetic).transform);
        return Math.hypot(m41, m42);
      });

    if (fine) {
      // The corner is past the cap, so it settles on exactly the 6px token (the spring may
      // overshoot by a fraction of a pixel on the way).
      await expect.poll(pull).toBeCloseTo(6, 1);
    } else {
      expect(await pull()).toBe(0);
    }
  });
});

test.describe('Manifesto', () => {
  const statement = (page: Page) =>
    page
      .getByRole('region', { name: defaultBrand.pillars.join(', ') })
      .locator('p')
      .filter({ hasText: `${defaultBrand.pillars[0]} your ` });

  const opacities = (target: Locator) =>
    target.evaluate((p) =>
      [...p.querySelectorAll('.scroll-text-word')].map((word) =>
        Number(getComputedStyle(word).opacity),
      ),
    );

  /**
   * Puts the statement's top `fromBottom` px above the bottom of the viewport. False when the page
   * can't scroll that far (a screen tall enough to show it from the top).
   */
  const placeTop = (target: Locator, fromBottom: number) =>
    target.evaluate(async (p, offset) => {
      const top = p.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - window.innerHeight + offset, behavior: 'instant' });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return Math.abs(p.getBoundingClientRect().top - (window.innerHeight - offset)) < 1;
    }, fromBottom);

  test('brightens a statement word by word as it scrolls up', async ({ page }) => {
    await page.goto('/');
    const target = statement(page);

    // Just peeking in at the bottom: nothing has brightened yet.
    test.skip(!(await placeTop(target, 4)), 'The statement is on screen from the top');
    await expect.poll(async () => Math.max(...(await opacities(target)))).toBeCloseTo(DIM, 2);

    // A little further: the first words are on their way, the last still waiting.
    const height = await target.evaluate((p) => p.getBoundingClientRect().height);
    const viewport = page.viewportSize()?.height ?? 0;
    await placeTop(target, 0.25 * (viewport + height));
    const partway = await opacities(target);
    expect(partway[0]).toBeGreaterThan(DIM);
    expect(partway.at(-1)).toBeCloseTo(DIM, 2);
    expect(partway).toEqual([...partway].sort((a, b) => b - a));

    // Centred in the viewport: every word at full strength.
    await placeTop(target, (viewport + height) / 2);
    await expect.poll(async () => Math.min(...(await opacities(target)))).toBe(1);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('keeps every word at full strength', async ({ page }) => {
      await page.goto('/');
      const target = statement(page);
      test.skip(!(await placeTop(target, 4)), 'The statement is on screen from the top');
      expect(new Set(await opacities(target))).toEqual(new Set([1]));
    });
  });
});
