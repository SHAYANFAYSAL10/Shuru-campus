import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  BeginLineHandoffSource,
  BeginLineHandoffTarget,
} from '@/components/motion/begin-line-handoff';
import { takeHandoff } from '@/lib/begin-line-handoff';
import { MEDIA } from '@/lib/hooks/use-media-query';
import { setMediaQuery } from '@/test/media';

const rect = (left: number, top: number, width: number) =>
  ({
    left,
    top,
    width,
    height: 4,
    right: left + width,
    bottom: top + 4,
    x: left,
    y: top,
  }) as DOMRect;

/** The hero line leaves the page and the nav line arrives in the same commit. */
function navigate({ heroTop = 300 } = {}) {
  const animate = vi.fn<(keyframes: Keyframe[]) => Animation>(
    () => ({ cancel: vi.fn() }) as unknown as Animation,
  );
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.dataset.line === 'hero' ? rect(40, heroTop, 400) : rect(520, 50, 80);
  });

  const { rerender } = render(
    <BeginLineHandoffSource>
      <span data-line="hero" />
    </BeginLineHandoffSource>,
  );
  // The wrapper is measured, so mark it as the hero's line.
  document.querySelector('span.block')?.setAttribute('data-line', 'hero');
  rerender(
    <BeginLineHandoffTarget>
      <span />
    </BeginLineHandoffTarget>,
  );
  return animate;
}

afterEach(() => {
  vi.restoreAllMocks();
  takeHandoff(0, 0);
});

describe('Begin line hand-off', () => {
  it('flies the hero line up into the nav underline, transform only', () => {
    const animate = navigate();

    expect(animate).toHaveBeenCalledOnce();
    expect(animate.mock.calls[0]?.[0]).toEqual([
      { transform: 'translate(-480px, 250px) scaleX(5)' },
      { transform: 'none' },
    ]);
  });

  it('does not fly a line the reader had scrolled away from', () => {
    expect(navigate({ heroTop: -200 })).not.toHaveBeenCalled();
  });

  it('just shows the nav line under reduced motion', () => {
    setMediaQuery(MEDIA.reducedMotion, true);
    expect(navigate()).not.toHaveBeenCalled();
  });

  it('shows the nav line in place when it was not handed anything', () => {
    const animate = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
    render(
      <BeginLineHandoffTarget>
        <span />
      </BeginLineHandoffTarget>,
    );
    expect(animate).not.toHaveBeenCalled();
  });
});
