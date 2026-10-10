import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PlanMorphLink, PlanMorphSource, PlanMorphTarget } from '@/components/motion/plan-morph';
import { MEDIA } from '@/lib/hooks/use-media-query';
import { planCardAttributes, takeMorph } from '@/lib/plan-morph';
import { setMediaQuery } from '@/test/media';

const rect = (left: number, top: number, width: number, height: number) =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
  }) as DOMRect;

// Like Next's link, it calls `onClick` and keeps the document (jsdom can't navigate).
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    transitionTypes,
    onClick,
    ...props
  }: React.ComponentProps<'a'> & { transitionTypes?: string[] }) => (
    <a
      href={href}
      {...props}
      data-transition-types={transitionTypes?.join(' ')}
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
      }}
    >
      {children}
    </a>
  ),
}));

/** A plan card: its photo and the link that leads to the plan. */
function renderCard() {
  render(
    <article {...planCardAttributes}>
      <PlanMorphSource slug="hot-desk">
        <span />
      </PlanMorphSource>
      <PlanMorphLink slug="hot-desk" href="/spaces/hot-desk">
        Hot Desk
      </PlanMorphLink>
    </article>,
  );
  return screen.getByRole('link', { name: 'Hot Desk' });
}

let animate: ReturnType<typeof vi.fn<(keyframes: Keyframe[]) => Animation>>;

beforeEach(() => {
  animate = vi.fn(() => ({ cancel: vi.fn(), onfinish: null }) as unknown as Animation);
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0);
    return 0;
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    // The card's photo (4:5, lower right), and the plan page's (3:2, top left).
    return 'planMorphSource' in this.dataset ? rect(853, 300, 360, 450) : rect(64, 200, 450, 300);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  takeMorph('', 0);
  Reflect.deleteProperty(document, 'startViewTransition');
});

describe('Plan card → detail', () => {
  it('marks the navigation from a card, for the native morph', () => {
    expect(renderCard()).toHaveAttribute('data-transition-types', 'plan-open');
  });

  it('flies the plan photo from the card that was followed (fallback)', () => {
    fireEvent.click(renderCard());
    render(
      <PlanMorphTarget slug="hot-desk">
        <span />
      </PlanMorphTarget>,
    );

    expect(animate).toHaveBeenCalledOnce();
    const [first, last] = animate.mock.calls[0]?.[0] ?? [];
    expect(first?.transform).toMatch(/^translate\(.+px, .+px\) scale\(1\.5\)$/);
    expect(first?.clipPath).toMatch(/^inset\(0px .+px round /);
    expect(last?.transform).toBe('none');
  });

  it("doesn't fly to another plan's page", () => {
    fireEvent.click(renderCard());
    render(
      <PlanMorphTarget slug="meeting-room">
        <span />
      </PlanMorphTarget>,
    );
    expect(animate).not.toHaveBeenCalled();
  });

  it('leaves it to the browser where it can morph the photo itself', () => {
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: vi.fn() });
    fireEvent.click(renderCard());
    render(
      <PlanMorphTarget slug="hot-desk">
        <span />
      </PlanMorphTarget>,
    );
    expect(animate).not.toHaveBeenCalled();
  });

  it('records nothing for a new-tab click', () => {
    fireEvent.click(renderCard(), { ctrlKey: true });
    render(
      <PlanMorphTarget slug="hot-desk">
        <span />
      </PlanMorphTarget>,
    );
    expect(animate).not.toHaveBeenCalled();
  });

  it('just shows the plan photo under reduced motion', () => {
    setMediaQuery(MEDIA.reducedMotion, true);
    fireEvent.click(renderCard());
    render(
      <PlanMorphTarget slug="hot-desk">
        <span />
      </PlanMorphTarget>,
    );
    expect(animate).not.toHaveBeenCalled();
  });

  it('shows the plan photo in place when nobody followed a card', () => {
    render(
      <PlanMorphTarget slug="hot-desk">
        <span />
      </PlanMorphTarget>,
    );
    expect(animate).not.toHaveBeenCalled();
  });
});
