'use client';

import { Pause, Play } from 'lucide-react';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

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

/**
 * A slow, endless horizontal scroll of items, with a visible pause button (WCAG 2.2.2). It also
 * pauses on hover and while focus is inside. Without JS or with reduced motion it's a plain
 * wrapped list, so nothing moves that the user can't stop.
 */
export function Marquee({ items, label, className }: MarqueeProps) {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState<number>();
  // How far into one loop (0–1) the track is, carried between the animation and manual scroll.
  const [progress, setProgress] = useState(0);
  const groupRef = useRef<HTMLUListElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const animated = hydrated && !reduced;

  // Constant speed whatever the content width: duration = one copy's width / px per second.
  useEffect(() => {
    const group = groupRef.current;
    if (!animated || !group) return;
    const observer = new ResizeObserver(() => {
      setSeconds(group.scrollWidth / marquee.pxPerSecond);
    });
    observer.observe(group);
    return () => {
      observer.disconnect();
    };
  }, [animated]);

  // Paused, the track stops animating and the viewport scrolls instead, so every item can be
  // swiped to. Start the scroll where the animation stopped, so nothing jumps.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || !group) return;
    viewport.scrollLeft = paused ? progress * group.scrollWidth : 0;
  }, [paused, progress]);

  function toggle() {
    const group = groupRef.current;
    const width = group?.scrollWidth ?? 0;
    if (width > 0 && !paused && trackRef.current) {
      const { transform } = getComputedStyle(trackRef.current);
      const x = !transform || transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
      setProgress((-x % width) / width);
    } else if (width > 0 && viewportRef.current) {
      setProgress((viewportRef.current.scrollLeft % width) / width);
    }
    setPaused((value) => !value);
  }

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

  // A negative delay resumes the loop from where it was paused or scrolled to.
  const trackStyle =
    seconds === undefined
      ? undefined
      : ({
          '--marquee-duration': `${seconds}s`,
          animationDelay: `${-progress * seconds}s`,
        } as CSSProperties);

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Hover and focus pause only this strip. Scoping the group here keeps the button out of
          it: a tapped button keeps focus, which would otherwise hold the strip paused. */}
      <div
        ref={viewportRef}
        // Focusable while it scrolls, so keyboards can reach every item too (axe's
        // scrollable-region-focusable): its items aren't focusable themselves.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={paused ? 0 : undefined}
        className={cn(
          'group/marquee min-w-0 flex-1',
          paused ? 'scrollbar-none overflow-x-auto overscroll-x-contain' : 'overflow-hidden',
        )}
      >
        <div
          ref={trackRef}
          data-testid="marquee-track"
          className={cn(
            'flex w-max',
            seconds !== undefined && !paused && 'animate-marquee',
            'group-focus-within/marquee:animation-paused group-hover/marquee:animation-paused',
            paused && 'animation-paused',
          )}
          style={trackStyle}
        >
          <ul ref={groupRef} aria-label={label} className="flex shrink-0 gap-8 pr-8">
            {listItems}
          </ul>
          {/* The second copy makes the loop seamless; assistive tech and keyboards skip it. */}
          <ul aria-hidden="true" inert className="flex shrink-0 gap-8 pr-8">
            {listItems}
          </ul>
        </div>
      </div>
      <IconButton
        label="Pause scrolling list"
        icon={paused ? Play : Pause}
        aria-pressed={paused}
        variant="secondary"
        size="sm"
        onClick={toggle}
      />
    </div>
  );
}
