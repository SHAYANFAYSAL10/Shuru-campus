'use client';

import { RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { SgGroup } from '@/app/%5Fstyleguide/_components/sg-section';
import { BeginLine } from '@/components/motion/begin-line';
import { Magnetic } from '@/components/motion/magnetic';
import { Marquee } from '@/components/motion/marquee';
import { SplitText } from '@/components/motion/split-text';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/lib/hooks/use-media-query';
import { duration, ease, spring, stagger } from '@/styles/motion';

/** A cubic-bezier drawn as a curve (x: time, y: progress). */
function EaseCurve({ points }: { points: readonly [number, number, number, number] }) {
  const [x1, y1, x2, y2] = points;
  const size = 100;
  const d = `M0 ${String(size)} C ${String(x1 * size)} ${String((1 - y1) * size)}, ${String(x2 * size)} ${String((1 - y2) * size)}, ${String(size)} 0`;
  return (
    <svg
      viewBox="-4 -4 108 108"
      aria-hidden="true"
      className="size-20 shrink-0 overflow-visible rounded-sm bg-bg-alt text-brand"
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}

export function MotionTokens() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <SgGroup title="Durations">
        <ul className="flex flex-col gap-3">
          {Object.entries(duration).map(([name, ms]) => (
            // Columns: token name, proportional bar, value.
            <li key={name} className="grid grid-cols-[6rem_1fr_4rem] items-center gap-3 text-small">
              <code className="font-mono text-fg">{name}</code>
              {/* Bar length is proportional to the duration (900ms = full width). */}
              <span
                aria-hidden="true"
                className="h-1.5 origin-left rounded-full bg-brand"
                style={{ transform: `scaleX(${String(ms / duration.story)})` }}
              />
              <span className="text-right font-mono text-fg-muted tabular-nums">{ms}ms</span>
            </li>
          ))}
        </ul>
        <p className="text-small text-fg-muted">
          Springs: snappy {spring.snappy.stiffness}/{spring.snappy.damping}, soft{' '}
          {spring.soft.stiffness}/{spring.soft.damping}. Stagger {stagger.step}ms per item, capped
          at {stagger.max}ms.
        </p>
      </SgGroup>
      <SgGroup title="Easing">
        <ul className="flex flex-wrap gap-6">
          {Object.entries(ease).map(([name, points]) => (
            <li key={name} className="flex items-center gap-3">
              <EaseCurve points={points} />
              <span className="text-small">
                <code className="block font-mono text-fg">ease.{name}</code>
                <span className="block font-mono text-fg-muted">{points.join(', ')}</span>
              </span>
            </li>
          ))}
        </ul>
      </SgGroup>
    </div>
  );
}

export function MotionDemos({ marqueeItems }: { marqueeItems: string[] }) {
  const [run, setRun] = useState(0);
  const reduced = useReducedMotion();

  return (
    <>
      <SgGroup
        title="Headline entrance"
        note="SplitText and BeginLine with the mount trigger run from CSS on first paint, before any JS. Under reduced motion they render in their final state."
      >
        <div className="flex flex-col items-start gap-6 rounded-lg border border-border bg-surface p-6 sm:p-10">
          <h3 key={run} className="type-h1 text-fg">
            <SplitText text="Your next chapter" trigger="mount" />{' '}
            <span className="relative inline-block">
              <em>
                <SplitText text="begins" trigger="mount" startIndex={3} />
              </em>
              <BeginLine draw="mount" delay={500} className="absolute inset-x-0 -bottom-1" />
            </span>{' '}
            <SplitText text="here." trigger="mount" startIndex={4} />
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setRun((value) => value + 1);
            }}
          >
            <RotateCcw aria-hidden="true" className="size-4" strokeWidth={1.5} />
            Replay
          </Button>
          {reduced ? (
            <p className="text-small text-fg-muted">
              Reduced motion is on, so the headline appears without movement.
            </p>
          ) : null}
        </div>
      </SgGroup>

      <SgGroup
        title="Magnetic"
        note="Pulls up to 6px toward the pointer. Fine pointers only, off under reduced motion."
      >
        <div>
          <Magnetic>
            <Button size="lg">Book a tour</Button>
          </Magnetic>
        </div>
      </SgGroup>

      <SgGroup
        title="Marquee"
        note="Pauses on hover and focus, and has a visible pause button. Without JS or with reduced motion it's a wrapped list."
      >
        <Marquee
          label="Spaces"
          items={marqueeItems.map((item) => (
            <span key={item} className="type-h3 text-fg-muted">
              {item}
            </span>
          ))}
        />
      </SgGroup>

      <SgGroup
        title="Reveal"
        note="Every group below this point is wrapped in Reveal. Scroll down: each fades and lifts in once. Content above the fold never animates."
      >
        <div className="h-px" />
      </SgGroup>
    </>
  );
}
