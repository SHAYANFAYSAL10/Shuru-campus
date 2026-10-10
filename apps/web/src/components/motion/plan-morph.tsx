'use client';

import NextLink from 'next/link';
import { type MouseEvent, type ReactNode, ViewTransition, useLayoutEffect, useRef } from 'react';

import { isOnScreen, type LineBox } from '@/lib/begin-line-handoff';
import { cn } from '@/lib/cn';
import { MEDIA } from '@/lib/hooks/use-media-query';
import {
  coverTransform,
  PLAN_CARD_ATTRIBUTE,
  PLAN_SOURCE_ATTRIBUTE,
  PLAN_LEAVE_CLASS,
  PLAN_MORPH_CLASS,
  PLAN_OPEN,
  planPhotoName,
  recordMorph,
  takeMorph,
  type MorphSource,
} from '@/lib/plan-morph';
import { cssEase, duration } from '@/styles/motion';

// The photo morphs only on a navigation from a plan card (PLAN_OPEN); any other route change
// leaves it alone. React names every card's photo before it knows which one pairs up, so the
// cards that don't fade out with the page rather than linger over the next one.
const SHARE = { [PLAN_OPEN]: PLAN_MORPH_CLASS, default: 'none' };
const LEAVE = { [PLAN_OPEN]: PLAN_LEAVE_CLASS, default: 'none' };
const TRANSITION_TYPES = [PLAN_OPEN];

function boxOf(element: Element): LineBox {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
}

/** Whether the browser morphs the photo itself (the View Transitions API). */
function nativeMorph(): boolean {
  return typeof document.startViewTransition === 'function';
}

function reducedMotion(): boolean {
  return window.matchMedia(MEDIA.reducedMotion).matches;
}

interface PlanMorphLinkProps {
  slug: string;
  href: string;
  className?: string;
  children: ReactNode;
}

/**
 * A plan card's link. Its navigation carries the PLAN_OPEN transition type. Where the browser
 * can't morph the photo, a plain click (not a new-tab one) records where the card's photo is, if
 * the reader can see it, for `PlanMorphTarget` to fly from.
 */
export function PlanMorphLink({ slug, href, className, children }: PlanMorphLinkProps) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (nativeMorph() || reducedMotion()) return;
    const photo = event.currentTarget
      .closest(`[${PLAN_CARD_ATTRIBUTE}]`)
      ?.querySelector(`[${PLAN_SOURCE_ATTRIBUTE}]`);
    if (!photo) return;
    const box = boxOf(photo);
    if (!isOnScreen(box, { width: window.innerWidth, height: window.innerHeight })) return;
    const radius = Number.parseFloat(getComputedStyle(photo).borderTopLeftRadius) || 0;
    recordMorph(slug, { box, radius }, performance.now());
  }

  return (
    <NextLink
      href={href}
      transitionTypes={TRANSITION_TYPES}
      onClick={onClick}
      className={className}
    >
      {children}
    </NextLink>
  );
}

interface PlanMorphPhotoProps {
  slug: string;
  className?: string;
  children: ReactNode;
}

/** Wraps a plan card's photo, which shares its view-transition-name with the plan page's photo. */
export function PlanMorphSource({ slug, className, children }: PlanMorphPhotoProps) {
  return (
    <ViewTransition name={planPhotoName(slug)} share={SHARE} exit={LEAVE} default="none">
      <div {...{ [PLAN_SOURCE_ATTRIBUTE]: '' }} className={className}>
        {children}
      </div>
    </ViewTransition>
  );
}

/**
 * Wraps the photo on a plan's own page. Arriving from that plan's card, it grows out of the card:
 * natively by the shared view-transition-name, or else by flying from where the card's photo was
 * (translate and an even scale, cropped to the card's shape; transform and clip-path only).
 * Reduced motion: a crossfade natively, otherwise it's simply there.
 */
export function PlanMorphTarget({ slug, className, children }: PlanMorphPhotoProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Taken once, so Strict Mode's second effect run (dev) still finds it.
  const source = useRef<MorphSource | null | undefined>(undefined);

  useLayoutEffect(() => {
    source.current ??= takeMorph(slug, performance.now());
    const from = source.current;
    const element = ref.current;
    if (!element || !from || reducedMotion()) return;

    let flight: Animation | undefined;
    // Measured in the next frame, before it paints: the router moves to the top of the page after
    // this effect, in the same commit.
    const frame = requestAnimationFrame(() => {
      const move = coverTransform(from.box, boxOf(element));
      if (!move) return;
      const radius = getComputedStyle(element).borderTopLeftRadius;
      const { x, y, scale, insetX, insetY } = move;
      flight = element.animate(
        [
          {
            transform: `translate(${x}px, ${y}px) scale(${scale})`,
            clipPath: `inset(${insetY}px ${insetX}px round ${from.radius / scale}px)`,
          },
          { transform: 'none', clipPath: `inset(0 round ${radius})` },
        ],
        { duration: duration.slow, easing: cssEase('out') },
      );
      flight.onfinish = () => {
        source.current = null;
      };
    });
    return () => {
      cancelAnimationFrame(frame);
      flight?.cancel();
    };
  }, [slug]);

  return (
    <ViewTransition name={planPhotoName(slug)} share={SHARE} exit={LEAVE} default="none">
      <div ref={ref} className={cn('origin-top-left', className)}>
        {children}
      </div>
    </ViewTransition>
  );
}
