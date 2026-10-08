import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { auditLayout, scrollThrough } from './page-checks';
import { PUBLIC_ROUTES } from './routes';

// docs/08-testing.md → Responsive invariants: every public route on every project, in the light
// theme and in the dark theme with reduced motion.
const MODES = [
  { name: 'light', colorScheme: 'light', reducedMotion: 'no-preference' },
  { name: 'dark, reduced motion', colorScheme: 'dark', reducedMotion: 'reduce' },
] as const;

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const route of PUBLIC_ROUTES) {
  for (const mode of MODES) {
    test.describe(`${route.name} (${mode.name})`, () => {
      test.use({ colorScheme: mode.colorScheme, reducedMotion: mode.reducedMotion });

      test.beforeEach(async ({ page }) => {
        await page.goto(route.path);
        await scrollThrough(page);
      });

      test('holds the layout invariants', async ({ page }, testInfo) => {
        const audit = await auditLayout(page);

        expect(audit.overflow, 'horizontal overflow (px)').toBeLessThanOrEqual(0);
        expect(audit.escaping, 'elements past the right edge').toEqual([]);
        expect(audit.clipped, 'clipped text').toEqual([]);
        expect(audit.invisible, 'content left invisible after scrolling').toEqual([]);
        if (testInfo.project.use.hasTouch) {
          expect(audit.smallTargets, 'touch targets under 44×44').toEqual([]);
        }
      });

      test('keeps the header short on landscape phones', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'mobile-landscape', 'Landscape phone only');
        const header = await page.getByRole('banner').boundingBox();
        const height = page.viewportSize()?.height ?? 0;
        expect(header?.height ?? Infinity).toBeLessThanOrEqual(height * 0.2);
      });

      test('has no axe violations', async ({ page }) => {
        const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        const summary = violations.map(
          (v) => `${v.id}: ${v.nodes.map((node) => node.target.join(' ')).join(', ')}`,
        );
        expect(summary).toEqual([]);
      });
    });
  }
}
