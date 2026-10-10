'use client';

import {
  Coffee,
  DoorClosed,
  Headphones,
  type LucideIcon,
  Presentation,
  Sofa,
  UtensilsCrossed,
} from 'lucide-react';
import { type CSSProperties, type RefObject, useEffect, useRef, useState } from 'react';

import { dhakaParts, type OpeningHours } from '@campus/contracts';

import { useProgressiveReveal } from '@/components/motion/use-progressive-reveal';
import { SnapCarousel } from '@/components/ui/snap-carousel';
import {
  DAY_MOMENTS,
  dayPosition,
  type DayPosition,
  highlightIndex,
  minutesToTime,
  stretchFill,
} from '@/lib/day-timeline';
import { useNowMinute } from '@/lib/hooks/use-now';
import { hoursSummary } from '@/lib/hours-summary';
import { displayTime, openStatusText } from '@/lib/open-status';
import { staggerDelay } from '@/styles/motion';

export interface DayTimelineProps {
  hours: OpeningHours;
  className?: string;
}

const ICONS: Record<(typeof DAY_MOMENTS)[number]['id'], LucideIcon> = {
  arrive: Coffee,
  'deep-work': Headphones,
  lunch: UtensilsCrossed,
  meeting: Presentation,
  timeout: Sofa,
  close: DoorClosed,
};

/**
 * Below `xl` the rail scrolls sideways, so its own scroll drives the highlight. From `xl` all six
 * moments fit, and the page's scroll does instead: the highlight walks the day as the rail rises
 * from three quarters of the way down the viewport to a quarter.
 */
const READ_FROM = 0.75;
const READ_TO = 0.25;

function scrollProgress(list: HTMLElement): number {
  const max = list.scrollWidth - list.clientWidth;
  if (max > 1) return list.scrollLeft / max;
  const viewport = window.innerHeight;
  const top = list.getBoundingClientRect().top;
  return (viewport * READ_FROM - top) / (viewport * (READ_FROM - READ_TO));
}

/** The highlighted moment, following scroll. `null` until hydrated (and without JS). */
function useScrollHighlight(listRef: RefObject<HTMLElement | null>, count: number) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setActive(highlightIndex(scrollProgress(list), count));
      });
    };
    update();
    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener('scroll', update);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [listRef, count]);

  return active;
}

/** "Sat–Thu 9:00–19:00 · Fri closed": what the status line says before it knows the time. */
function weekText(hours: OpeningHours): string {
  return hoursSummary(hours)
    .map((row) => `${row.days} ${row.time ?? 'closed'}`)
    .join(' · ');
}

/**
 * The rail of "A day at {shortName}" (04 §6, signature moment 5): the moments of the day in
 * order on a native horizontal scroller with snap (until `xl`, where they all fit). While the
 * space is open, the begin line runs along the rail from opening to the current Dhaka time, with
 * a "Now" marker at its tip; it moves each minute and draws in the first time the rail scrolls
 * into view. As the rail (or, from `xl`, the page) scrolls, the moment in reach is highlighted.
 *
 * Without JS (and until hydrated, since the server can't know the reader's minute): the moments
 * and the week's hours, with no line. Reduced motion: the line and highlight change at once.
 */
export function DayTimeline({ hours, className }: DayTimelineProps) {
  const listRef = useRef<HTMLElement>(null);
  const now = useNowMinute();
  const active = useScrollHighlight(listRef, DAY_MOMENTS.length);
  // The line waits off screen, then draws in (stretch by stretch) when the rail scrolls in.
  const { ref: railRef, state: reveal } = useProgressiveReveal<HTMLDivElement>();

  const status = now ? openStatusText(hours, now) : null;
  const minutes = now ? dhakaParts(now).minutes : null;
  const position: DayPosition | null =
    status?.open && minutes !== null ? dayPosition(DAY_MOMENTS, minutes) : null;
  const drawn = reveal !== 'hidden';

  return (
    <div ref={railRef} className={className}>
      <SnapCarousel
        ordered
        focusable
        listRef={listRef}
        label="The day, hour by hour"
        itemName="moment"
        // One column per moment: 80% below `sm` (the next one peeks in, so the rail reads as
        // scrollable), then 45%, 32% and 26%; from `xl` all six share the row. No gap: each
        // moment's stretch of rail runs on to the next one's dot.
        listClassName="grid grid-flow-col gap-0 auto-cols-[80%] max-xl:bleed-page-x sm:auto-cols-[45%] md:auto-cols-[32%] lg:auto-cols-[26%] xl:grid-flow-row xl:grid-cols-6 xl:overflow-visible"
        buttonsClassName="xl:hidden"
        buttonVariant="onBrand"
        aside={
          <p className="text-small">
            {status && minutes !== null ? (
              <>
                <span className="tabular-nums">{minutesToTime(minutes)}</span> in Dhaka ·{' '}
                {status.label}
                {status.detail ? `, ${status.detail}` : null}
              </>
            ) : (
              weekText(hours)
            )}
          </p>
        }
      >
        {DAY_MOMENTS.map((moment, i) => {
          const Icon = ICONS[moment.id];
          const isNow = position?.index === i;
          const passed = position !== null && i <= position.index;
          const last = i === DAY_MOMENTS.length - 1;
          return (
            <li
              key={moment.id}
              data-day-moment=""
              data-active={active === i ? '' : undefined}
              aria-current={isNow ? 'time' : undefined}
              className="group/moment snap-start"
            >
              <div className="day-rail">
                {last ? null : (
                  <span aria-hidden="true" className="day-stretch">
                    <span
                      className="day-stretch-fill"
                      style={
                        {
                          '--fill': drawn ? stretchFill(position, i) : 0,
                          transitionDelay: `${String(staggerDelay(i))}ms`,
                        } as CSSProperties
                      }
                    />
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className="day-dot"
                  data-passed={passed ? '' : undefined}
                />
                {isNow && drawn && minutes !== null ? (
                  <span
                    className="day-now"
                    style={{ '--fraction': position.fraction } as CSSProperties}
                  >
                    <span className="day-now-label text-small font-medium">
                      Now <span className="tabular-nums">{minutesToTime(minutes)}</span>
                    </span>
                    <span aria-hidden="true" className="day-now-dot" />
                  </span>
                ) : null}
              </div>

              <div className="day-card">
                <div className="flex items-center gap-3">
                  <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.5} />
                  <time dateTime={moment.time} className="type-h3 tabular-nums">
                    {displayTime(moment.time)}
                  </time>
                </div>
                <h3 className="mt-4 font-medium">{moment.title}</h3>
                <p className="mt-1 text-small text-pretty">{moment.text}</p>
              </div>
            </li>
          );
        })}
      </SnapCarousel>
    </div>
  );
}
