import { type Page } from '@playwright/test';

/** Scrolls down half a screen at a time, so every progressive reveal fires, then back to the top. */
export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await frame();
      await frame();
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Let scroll handlers react (the header comes back) so their transitions have started.
    for (let i = 0; i < 3; i++) await frame();
  });
  await settleAnimations(page);
}

/** Waits for every finite animation and transition on the page to finish. */
export async function settleAnimations(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const finite = document
      .getAnimations()
      .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);
    await Promise.all(finite.map((animation) => animation.finished.catch(() => undefined)));
  });
}

export interface LayoutAudit {
  /** How far the document is wider than the viewport, in px. */
  overflow: number;
  /** Visible elements reaching past the right edge of the viewport. */
  escaping: string[];
  /** Headings, buttons and links whose text is cut off. */
  clipped: string[];
  /** Interactive elements under 44×44, except links in running text. */
  smallTargets: string[];
  /** Text and images left at opacity 0 (somewhere up the tree). */
  invisible: string[];
}

/** The responsive invariants of docs/08-testing.md, measured in the page as it stands. */
export function auditLayout(page: Page): Promise<LayoutAudit> {
  return page.evaluate(() => {
    const MIN_TARGET = 44;
    const all = [...document.body.querySelectorAll('*')];

    const label = (element: Element) => {
      const text = element.getAttribute('aria-label') ?? element.textContent.trim();
      return `<${element.tagName.toLowerCase()}> ${text.slice(0, 40)}`.trim();
    };
    const hasBox = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 1 && rect.height > 1;
    };
    // Content clipped by an ancestor (a word mask, a photo frame) is judged by that ancestor.
    const clippedByAncestor = (element: Element) => {
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        if (getComputedStyle(parent).overflowX !== 'visible') return true;
      }
      return false;
    };
    const opacity = (element: Element) => {
      let value = 1;
      for (let node: Element | null = element; node; node = node.parentElement) {
        value *= Number.parseFloat(getComputedStyle(node).opacity);
      }
      return value;
    };
    const ownText = (element: Element) =>
      [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
      );
    // The hit-target utility grows the touch area with an absolutely positioned ::after.
    const hitSize = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const after = getComputedStyle(element, '::after');
      const grown = after.content !== 'none' && after.position === 'absolute';
      return {
        width: Math.max(rect.width, grown ? Number.parseFloat(after.width) || 0 : 0),
        height: Math.max(rect.height, grown ? Number.parseFloat(after.height) || 0 : 0),
      };
    };

    const escaping = all.filter(
      (element) =>
        !element.closest('[data-allow-overflow]') &&
        hasBox(element) &&
        element.getBoundingClientRect().right > window.innerWidth + 1 &&
        !clippedByAncestor(element),
    );

    // Only boxes that clip can cut text off (overflowing visible boxes are caught as escaping).
    // Inline boxes report a clientWidth of 0, and visually hidden ones are 1px by design.
    const clipped = [...document.querySelectorAll('h1, h2, h3, button, a')].filter(
      (element) =>
        getComputedStyle(element).overflowX !== 'visible' &&
        element.clientWidth > 1 &&
        element.scrollWidth > element.clientWidth + 1,
    );

    const smallTargets = [
      ...document.querySelectorAll(
        'a[href], button, input, select, textarea, [role="button"], [role="switch"], [role="radio"]',
      ),
    ].filter((element) => {
      if (!hasBox(element) || getComputedStyle(element).visibility === 'hidden') return false;
      // Visually hidden controls (the inquiry form's honeypot) are no one's target.
      if (element.closest('.sr-only')) return false;
      // WCAG 2.5.8's inline exception: links in running text.
      if (element.tagName === 'A' && getComputedStyle(element).display === 'inline') return false;
      const size = hitSize(element);
      return size.width < MIN_TARGET - 0.5 || size.height < MIN_TARGET - 0.5;
    });

    const invisible = all.filter(
      (element) =>
        (ownText(element) || element.tagName === 'IMG') &&
        !element.closest('.sr-only, [hidden], [inert]') &&
        hasBox(element) &&
        opacity(element) === 0,
    );

    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      escaping: escaping.map(label),
      clipped: clipped.map(label),
      smallTargets: smallTargets.map(label),
      invisible: invisible.map(label),
    };
  });
}
