import { type DayHours, type OpeningHours } from '@campus/contracts';

import { displayTime } from '@/lib/open-status';

/** The working week in Dhaka starts on Saturday (0 = Sunday … 6 = Saturday). */
const WEEK_FROM_SATURDAY = [6, 0, 1, 2, 3, 4, 5] as const;
const SHORT_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const LONG_DAY = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export interface HoursRow {
  /** "Sat–Thu", for the eye. */
  days: string;
  /** "Saturday to Thursday", for screen readers. */
  daysLong: string;
  /** "9:00–19:00", or `null` when closed. */
  time: string | null;
}

function sameHours(a: DayHours, b: DayHours): boolean {
  return a.open === b.open && a.close === b.close;
}

function dayRange(names: readonly string[], first: number, last: number, joiner: string): string {
  const from = names[first] ?? '';
  const to = names[last] ?? '';
  return first === last ? from : `${from}${joiner}${to}`;
}

/**
 * Opening hours folded into runs of consecutive days with the same times, from Saturday:
 * Sat–Thu 9:00–19:00 · Fri closed.
 */
export function hoursSummary(hours: OpeningHours): HoursRow[] {
  const days = WEEK_FROM_SATURDAY.map((day) => hours.weekly.find((d) => d.day === day)).filter(
    (d): d is DayHours => d !== undefined,
  );

  const runs: DayHours[][] = [];
  for (const day of days) {
    const run = runs.at(-1);
    const previous = run?.at(-1);
    if (run && previous && sameHours(previous, day)) run.push(day);
    else runs.push([day]);
  }

  return runs.map((run) => {
    const first = run[0]?.day ?? 0;
    const last = run.at(-1)?.day ?? first;
    const { open, close } = run[0] ?? { open: null, close: null };
    return {
      days: dayRange(SHORT_DAY, first, last, run.length > 2 ? '–' : ', '),
      daysLong: dayRange(LONG_DAY, first, last, run.length > 2 ? ' to ' : ' and '),
      time: open && close ? `${displayTime(open)}–${displayTime(close)}` : null,
    };
  });
}

export interface DayRow {
  /** 0 = Sunday … 6 = Saturday. */
  day: number;
  /** "Saturday". */
  name: string;
  /** "9:00–19:00", or `null` when closed. */
  time: string | null;
}

/** One row per day, from Saturday, for the hours table on Home (Visit us). */
export function hoursByDay(hours: OpeningHours): DayRow[] {
  return WEEK_FROM_SATURDAY.flatMap((day) => {
    const entry = hours.weekly.find((d) => d.day === day);
    if (!entry) return [];
    const { open, close } = entry;
    return [
      {
        day,
        name: LONG_DAY[day],
        time: open && close ? `${displayTime(open)}–${displayTime(close)}` : null,
      },
    ];
  });
}
