'use client';

import { useState } from 'react';

import { odometerColumns } from '@/lib/odometer';
import { staggerDelay } from '@/styles/motion';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export interface OdometerProps {
  /** The formatted figure, "10,000". Digits roll; anything else ("," "−") stays put. */
  text: string;
  className?: string;
}

/**
 * A figure whose digits roll to their new value when it changes (04 §6, signature moment 4).
 * Each digit is a clipped column over a 0–9 strip moved by `transform` only, so with tabular
 * figures (set by the caller) nothing changes width while it rolls. Places are keyed from the
 * right, so the ones lead (a 50ms stagger leftward) and a figure that grows only adds columns on
 * the left, which fade in (`styles/odometer.css`). The first paint is the value at rest, so the
 * HTML reads the same without JS. Reduced motion: the digits change at once.
 *
 * Purely visual: the caller hides it from screen readers and gives them the figure as text.
 */
export function Odometer({ text, className }: OdometerProps) {
  // Adjusting state during render (not an effect), so the change paints in one frame.
  const [previous, setPrevious] = useState(text);
  const [rolled, setRolled] = useState(false);
  if (text !== previous) {
    setPrevious(text);
    setRolled(true);
  }

  return (
    <span data-odometer="" data-rolled={rolled ? '' : undefined} className={className}>
      {odometerColumns(text).map((column) => {
        if (column.kind === 'static') return <span key={column.key}>{column.char}</span>;
        return (
          <span
            key={column.key}
            data-odometer-digit=""
            // Clips the strip to one line. Not `overflow: hidden`, which would move the
            // inline-block's baseline to its bottom edge and lift it off the ৳ and the unit.
            className="relative inline-block [clip-path:inset(0)]"
          >
            {/* Sizes the column: one tabular digit wide, one line tall, on the baseline. */}
            <span className="invisible">{column.digit}</span>
            <span
              className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-slow ease-out motion-reduce:transition-none"
              style={{
                // The strip is ten lines tall, so each 10% is one digit.
                transform: `translateY(${String(column.digit * -10)}%)`,
                transitionDelay: `${String(staggerDelay(column.rank))}ms`,
              }}
            >
              {DIGITS.map((digit) => (
                <span key={digit}>{digit}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
