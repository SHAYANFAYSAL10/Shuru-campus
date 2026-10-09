'use client';

import { Pause, Play } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/cn';
import { useHydrated } from '@/lib/hooks/use-hydrated';
import { useReducedMotion } from '@/lib/hooks/use-media-query';
import { marquee } from '@/styles/motion';

export interface MarqueeProps {
  items: ReactNode[];
  /** Names the list for screen readers, e.g. "Who works here". */
  label: string;
  className?: string;
}

// The row holds three copies and keeps its scroll inside the middle one, so it loops seamlessly
// whichever way it's swiped.
const COPIES = 3;

/**
 * A slow, endless horizontal drift of items that people can also swipe, scroll or arrow through
 * themselves, with a visible pause button (WCAG 2.2.2). It drifts by scrolling, not by a
 * transform, so native touch, momentum and wheel scrolling just work; the drift holds while the
 * pointer is over it, focus is inside or someone is scrolling, and picks up again shortly after.
 * Without JS or with reduced motion it's a plain wrapped list, so nothing moves on its own.
 */
export function Marquee({ items, label, className }: MarqueeProps) {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  // Read by the drift loop, so toggling pause doesn't restart it (and lose its place).
  const pausedRef = useRef(paused);
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLUListElement>(null);
  const animated = hydrated && !reduced;

  useEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!animated || !viewport || !group) return;

    // Our own position, kept as a float: browsers may round scrollLeft, which would stall a
    // sub-pixel step per frame.
    let position = 0;
    let width = 0;
    let holdUntil = 0;
    let hovered = false;
    let touching = false;
    let frame = 0;
    let last = performance.now();

    const wrap = (x: number) => (width > 0 ? width + ((((x - width) % width) + width) % width) : x);
    const jump = (x: number) => {
      position = wrap(x);
      viewport.scrollLeft = position;
    };
    const hold = () => {
      holdUntil = performance.now() + marquee.resumeAfter;
    };

    const tick = (now: number) => {
      const held =
        pausedRef.current ||
        hovered ||
        touching ||
        now < holdUntil ||
        viewport.contains(document.activeElement);
      if (!held && width > 0) jump(position + (marquee.pxPerSecond * (now - last)) / 1000);
      last = now;
      frame = requestAnimationFrame(tick);
    };

    // Scrolls we didn't make are the user's: follow them, and loop once they leave the middle copy.
    const onScroll = () => {
      if (Math.abs(viewport.scrollLeft - position) < 1) return;
      hold();
      position = viewport.scrollLeft;
      if (width > 0 && (position < width || position >= 2 * width) && !touching) jump(position);
    };
    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') hovered = true;
    };
    const onPointerLeave = () => {
      hovered = false;
    };
    const onTouchStart = () => {
      touching = true;
    };
    const onTouchEnd = () => {
      touching = false;
      hold();
    };

    const observer = new ResizeObserver(() => {
      const offset = width > 0 ? position - width : 0;
      width = group.offsetWidth;
      jump(width + offset);
    });
    observer.observe(group);
    viewport.addEventListener('scroll', onScroll, { passive: true });
    viewport.addEventListener('pointerenter', onPointerEnter);
    viewport.addEventListener('pointerleave', onPointerLeave);
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
    viewport.addEventListener('touchcancel', onTouchEnd, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      viewport.removeEventListener('scroll', onScroll);
      viewport.removeEventListener('pointerenter', onPointerEnter);
      viewport.removeEventListener('pointerleave', onPointerLeave);
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchend', onTouchEnd);
      viewport.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [animated]);

  const listItems = items.map((item, i) => (
    // Items are static content in a fixed order.
    <li key={i} className="shrink-0">
      {item}
    </li>
  ));

  if (!animated) {
    return (
      <ul aria-label={label} className={cn('flex flex-wrap gap-x-8 gap-y-3', className)}>
        {listItems}
      </ul>
    );
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div
        ref={viewportRef}
        data-testid="marquee-viewport"
        // A scroll region whose items aren't focusable, so keyboards need it to be (axe's
        // scrollable-region-focusable).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="scrollbar-none min-w-0 flex-1 overflow-x-auto overscroll-x-contain"
      >
        <div className="flex w-max">
          {Array.from({ length: COPIES }, (_, copy) =>
            copy === 1 ? (
              <ul key={copy} ref={groupRef} aria-label={label} className="flex shrink-0 gap-8 pr-8">
                {listItems}
              </ul>
            ) : (
              // The outer copies make the loop seamless; assistive tech and keyboards skip them.
              <ul key={copy} aria-hidden="true" inert className="flex shrink-0 gap-8 pr-8">
                {listItems}
              </ul>
            ),
          )}
        </div>
      </div>
      <IconButton
        label="Pause scrolling list"
        icon={paused ? Play : Pause}
        aria-pressed={paused}
        variant="secondary"
        size="sm"
        onClick={() => {
          pausedRef.current = !paused;
          setPaused(!paused);
        }}
      />
    </div>
  );
}
