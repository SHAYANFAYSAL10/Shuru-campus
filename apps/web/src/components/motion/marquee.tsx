'use client';

import { Pause, Play } from 'lucide-react';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

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
  const groupRef = useRef<HTMLUListElement>(null);
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

  const trackStyle =
    seconds === undefined ? undefined : ({ '--marquee-duration': `${seconds}s` } as CSSProperties);

  return (
    <div className={cn('group flex items-center gap-4', className)}>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          data-testid="marquee-track"
          className={cn(
            'flex w-max',
            seconds !== undefined && 'animate-marquee',
            'group-focus-within:animation-paused group-hover:animation-paused',
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
        onClick={() => {
          setPaused((value) => !value);
        }}
      />
    </div>
  );
}
