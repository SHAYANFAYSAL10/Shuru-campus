'use client';

import { dhakaParts, type OpeningHours } from '@campus/contracts';

import { cn } from '@/lib/cn';
import { useNowMinute } from '@/lib/hooks/use-now';
import { hoursByDay } from '@/lib/hours-summary';

export interface HoursTableProps {
  hours: OpeningHours;
  className?: string;
}

/**
 * The week's opening hours, one row per day from Saturday (Home → Visit us). The whole table is
 * in the server HTML; today's row (Dhaka time) is marked once hydrated, so a cached page never
 * highlights yesterday. "Today" is spelled out, not shown by color alone (A5).
 */
export function HoursTable({ hours, className }: HoursTableProps) {
  const now = useNowMinute();
  const today = now ? dhakaParts(now).weekday : null;

  return (
    <table className={cn('w-full border-separate border-spacing-0 text-fg', className)}>
      <caption className="sr-only">Opening hours, Dhaka time</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">Day</th>
          <th scope="col">Hours</th>
        </tr>
      </thead>
      <tbody>
        {hoursByDay(hours).map((row) => {
          const isToday = row.day === today;
          // Cells carry the row's fill and rounded ends: table rows can't be rounded.
          const cell = cn(
            'border-b border-border py-2.5 transition-colors duration-fast ease-out',
            isToday && 'border-transparent bg-accent-subtle',
          );
          return (
            <tr key={row.day} aria-current={isToday ? 'date' : undefined}>
              <th
                scope="row"
                className={cn(cell, 'ps-3 pe-4 text-start font-normal', isToday && 'rounded-s-sm')}
              >
                <span className="inline-flex flex-wrap items-center gap-x-2">
                  {row.name}
                  {isToday ? <span className="type-eyebrow text-accent-text">Today</span> : null}
                </span>
              </th>
              <td
                className={cn(
                  cell,
                  'pe-3 text-end tabular-nums',
                  row.time ? null : 'text-fg-muted',
                  isToday && 'rounded-e-sm text-fg',
                )}
              >
                {row.time ?? 'Closed'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
