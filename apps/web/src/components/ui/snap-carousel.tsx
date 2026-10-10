'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/cn';
import { useHydrated } from '@/lib/hooks/use-hydrated';
import { useReducedMotion } from '@/lib/hooks/use-media-query';

export interface SnapCarouselProps {
  /** Names the list for screen readers, e.g. "Plans". */
  label: string;
  /** What one item is, for the buttons: "plan" → "Previous plan" / "Next plan". */
  itemName: string;
  /** The `<li>` items. */
  children: ReactNode;
  /** An `<ol>` instead of a `<ul>`, for items whose order means something (a timeline). */
  ordered?: boolean;
  /** `onBrand` when the carousel sits on the lake band (`surface-brand`). */
  buttonVariant?: 'secondary' | 'onBrand';
  /**
   * Lets keyboard users focus the list to scroll it with the arrow keys. Needed when the items
   * hold nothing focusable of their own (WCAG 2.1.1; axe `scrollable-region-focusable`).
   */
  focusable?: boolean;
  /** Also receives the list element, for callers that follow its scroll. */
  listRef?: RefObject<HTMLElement | null>;
  /**
   * Classes for the list. It's a horizontal snap scroller by default; add the breakpoint where it
   * becomes something else (e.g. `md:grid md:grid-cols-2 md:overflow-visible`).
   */
  listClassName?: string;
  /** Classes for the controls row under the list. */
  controlsClassName?: string;
  /** Classes for the previous/next pair, e.g. `md:hidden` where the list stops scrolling. */
  buttonsClassName?: string;
  /** Shown at the start of the controls row, with or without JS (e.g. "Compare all plans"). */
  aside?: ReactNode;
  className?: string;
}

interface Edges {
  atStart: boolean;
  atEnd: boolean;
}

/** Within a pixel counts as there: snapping and zoom leave sub-pixel scroll offsets. */
const EDGE_SLACK = 1;

function readEdges(list: HTMLElement): Edges {
  return {
    atStart: list.scrollLeft <= EDGE_SLACK,
    atEnd: list.scrollLeft + list.clientWidth >= list.scrollWidth - EDGE_SLACK,
  };
}

/**
 * A native horizontal scroller with scroll snap (05 → Home #3), plus previous/next buttons that
 * move one item at a time. Swiping, trackpads and Tab (the browser scrolls a focused link into
 * view) all work on their own; the buttons are for everyone else. They appear once hydrated
 * (they need JS), go disabled at the ends, and jump instead of gliding under reduced motion.
 * Without JS the list still scrolls and snaps.
 */
export function SnapCarousel({
  label,
  itemName,
  children,
  ordered = false,
  buttonVariant = 'secondary',
  focusable = false,
  listRef: externalListRef,
  listClassName,
  controlsClassName,
  buttonsClassName,
  aside,
  className,
}: SnapCarouselProps) {
  const listId = useId();
  const listRef = useRef<HTMLElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  /** Which button had focus when the edges were last read (see the focus hand-off below). */
  const focusedRef = useRef<'prev' | 'next' | null>(null);
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const [edges, setEdges] = useState<Edges>({ atStart: true, atEnd: false });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const active = document.activeElement;
        focusedRef.current =
          active === prevRef.current ? 'prev' : active === nextRef.current ? 'next' : null;
        const next = readEdges(list);
        setEdges((prev) =>
          prev.atStart === next.atStart && prev.atEnd === next.atEnd ? prev : next,
        );
      });
    };
    update();
    list.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, []);

  // A button that disables itself while focused would drop focus to <body> (it's re-rendered
  // without its tooltip, so by now it's a new element); hand focus to the other one instead.
  useEffect(() => {
    if (edges.atStart && focusedRef.current === 'prev') nextRef.current?.focus();
    if (edges.atEnd && focusedRef.current === 'next') prevRef.current?.focus();
  }, [edges]);

  const step = useCallback(
    (direction: -1 | 1) => {
      const list = listRef.current;
      const item = list?.firstElementChild;
      if (!list || !item) return;
      const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
      // Snap settles on the nearest item, so one item's width (plus the gap) moves exactly one.
      list.scrollBy({
        left: direction * (item.getBoundingClientRect().width + gap),
        behavior: reduced ? 'instant' : 'smooth',
      });
    },
    [reduced],
  );

  const setList = useCallback(
    (node: HTMLUListElement | HTMLOListElement | null) => {
      listRef.current = node;
      if (externalListRef) externalListRef.current = node;
    },
    [externalListRef],
  );
  const List = ordered ? 'ol' : 'ul';

  return (
    <div className={className}>
      <List
        ref={setList}
        id={listId}
        aria-label={label}
        tabIndex={focusable ? 0 : undefined}
        className={cn(
          'scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain',
          listClassName,
        )}
      >
        {children}
      </List>
      <div
        className={cn('mt-6 flex min-h-11 items-center justify-between gap-4', controlsClassName)}
      >
        <div className="min-w-0">{aside}</div>
        {hydrated ? (
          <div className={cn('flex shrink-0 gap-2', buttonsClassName)}>
            <IconButton
              ref={prevRef}
              label={`Previous ${itemName}`}
              icon={ArrowLeft}
              variant={buttonVariant}
              aria-controls={listId}
              disabled={edges.atStart}
              onClick={() => {
                step(-1);
              }}
            />
            <IconButton
              ref={nextRef}
              label={`Next ${itemName}`}
              icon={ArrowRight}
              variant={buttonVariant}
              aria-controls={listId}
              disabled={edges.atEnd}
              onClick={() => {
                step(1);
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
