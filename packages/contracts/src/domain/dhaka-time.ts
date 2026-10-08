/** Every date and time decision on the site uses Dhaka time (UTC+6, no DST). */
export const SITE_TIMEZONE = 'Asia/Dhaka';

export interface ZonedParts {
  /** ISO calendar date, e.g. `2026-10-09`. */
  date: string;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  /** Minutes since local midnight. */
  minutes: number;
}

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SITE_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Breaks an instant into Dhaka wall-clock parts, independent of the machine timezone. */
export function dhakaParts(instant: Date): ZonedParts {
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map((p) => [p.type, p.value] as const),
  );
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  return {
    date: `${parts.year ?? ''}-${parts.month ?? ''}-${parts.day ?? ''}`,
    weekday: WEEKDAYS.indexOf(parts.weekday ?? ''),
    minutes: hour * 60 + minute,
  };
}

/** Today's calendar date in Dhaka, e.g. `2026-10-09`. */
export function dhakaToday(instant: Date = new Date()): string {
  return dhakaParts(instant).date;
}

/** Adds whole years to an ISO date string (Feb 29 rolls to Mar 1). */
export function addYearsIso(isoDate: string, years: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC((y ?? 0) + years, (m ?? 1) - 1, d ?? 1));
  return date.toISOString().slice(0, 10);
}
