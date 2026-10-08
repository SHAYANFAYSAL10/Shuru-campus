import { dhakaParts } from './dhaka-time';
import { toMinutes } from '../schemas/primitives';
import { type DayHours, type OpeningHours } from '../schemas/site';

/** Asia/Dhaka is UTC+6 all year (no DST). */
const DHAKA_OFFSET_MINUTES = 6 * 60;
const MINUTE_MS = 60_000;

function dayEntry(hours: OpeningHours, weekday: number): DayHours | undefined {
  return hours.weekly.find((d) => d.day === weekday);
}

/** The instant of Dhaka wall-clock `minutes` on the Dhaka date `dayOffset` days after `date`. */
function dhakaInstant(date: string, dayOffset: number, minutes: number): Date {
  const [y, m, d] = date.split('-').map(Number);
  const midnightUtc = Date.UTC(y ?? 0, (m ?? 1) - 1, (d ?? 1) + dayOffset);
  return new Date(midnightUtc + (minutes - DHAKA_OFFSET_MINUTES) * MINUTE_MS);
}

/** Whether the space is open at `instant`. Opening time is inclusive, closing exclusive. */
export function isOpenAt(hours: OpeningHours, instant: Date): boolean {
  const { weekday, minutes } = dhakaParts(instant);
  const today = dayEntry(hours, weekday);
  if (!today?.open || !today.close) return false;
  return minutes >= toMinutes(today.open) && minutes < toMinutes(today.close);
}

export interface HoursChange {
  /** State right now. */
  isOpen: boolean;
  /** What happens next: it `closes` (when open) or `opens` (when closed). */
  kind: 'opens' | 'closes';
  /** When the change happens. */
  at: Date;
  /** Whole minutes from `instant` until the change (rounded up, so never 0 while pending). */
  minutesUntil: number;
  /** Days between today (Dhaka) and the change: 0 = today, 1 = tomorrow, … */
  dayOffset: number;
  /** Weekday of the change, 0 = Sunday. */
  weekday: number;
}

/**
 * The next open/close transition after `instant`, or `null` when the week has no open day.
 * All calendar math happens in Dhaka time, regardless of the machine's timezone.
 */
export function nextChange(hours: OpeningHours, instant: Date): HoursChange | null {
  const { date, weekday, minutes } = dhakaParts(instant);
  const build = (kind: HoursChange['kind'], dayOffset: number, atMinutes: number) => {
    const at = dhakaInstant(date, dayOffset, atMinutes);
    return {
      isOpen: kind === 'closes',
      kind,
      at,
      minutesUntil: Math.ceil((at.getTime() - instant.getTime()) / MINUTE_MS),
      dayOffset,
      weekday: (weekday + dayOffset) % 7,
    };
  };

  const today = dayEntry(hours, weekday);
  if (today?.open && today.close) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (minutes >= open && minutes < close) return build('closes', 0, close);
    if (minutes < open) return build('opens', 0, open);
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const day = dayEntry(hours, (weekday + offset) % 7);
    if (day?.open) return build('opens', offset, toMinutes(day.open));
  }
  return null;
}
