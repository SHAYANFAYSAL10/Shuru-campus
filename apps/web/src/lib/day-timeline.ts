/**
 * "A day at {shortName}" (docs/05-pages-and-interactions.md → Home #6): the moments of a working
 * day on the 9:00 → 19:00 rail, and the arithmetic that places the current Dhaka time on it.
 * Times are Dhaka wall-clock `HH:MM`, in order.
 */
export interface DayMoment {
  id: string;
  /** `HH:MM`, Dhaka time. */
  time: string;
  title: string;
  text: string;
}

export const DAY_MOMENTS = [
  {
    id: 'arrive',
    time: '09:00',
    title: 'Arrive & coffee',
    text: 'Doors open. Pour the first of the unlimited tea and coffee, and settle in.',
  },
  {
    id: 'deep-work',
    time: '10:00',
    title: 'Deep work',
    text: 'Heads down in the Silent Room while the morning is at its quietest.',
  },
  {
    id: 'lunch',
    time: '13:00',
    title: 'Lunch',
    text: 'Order in from the café, and take a proper break from the screen.',
  },
  {
    id: 'meeting',
    time: '15:00',
    title: 'Meeting room',
    text: 'The call, the pitch, the planning session: there’s a room with a screen for it.',
  },
  {
    id: 'timeout',
    time: '17:00',
    title: 'Timeout zone',
    text: 'Step away, reset, and compare notes before the last push of the day.',
  },
  {
    id: 'close',
    time: '19:00',
    title: 'Close',
    text: 'Lights down. Your desk will be here when you’re back.',
  },
] as const satisfies readonly DayMoment[];

/** `09:30` → 570. */
export function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** 570 → `9:30` (no leading zero on the hour, like `displayTime`). */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  return `${String(hours)}:${String(minutes % 60).padStart(2, '0')}`;
}

/** Where a time falls on the rail: in the stretch after `index`, `fraction` of the way along. */
export interface DayPosition {
  index: number;
  /** 0 at the moment itself, approaching 1 at the next. */
  fraction: number;
}

/**
 * Where `minutes` (since Dhaka midnight) falls among the moments, or `null` before the first or
 * after the last. The last moment itself is index `last`, fraction 0. The rail spaces moments
 * evenly, so the position is piecewise: each stretch is scaled to its own length of time.
 */
export function dayPosition(moments: readonly DayMoment[], minutes: number): DayPosition | null {
  const times = moments.map((moment) => timeToMinutes(moment.time));
  const first = times[0];
  const last = times.at(-1);
  if (first === undefined || last === undefined || minutes < first || minutes > last) return null;

  for (let index = times.length - 1; index >= 0; index--) {
    const start = times[index] ?? 0;
    if (minutes < start) continue;
    const end = times[index + 1];
    const fraction = end === undefined ? 0 : (minutes - start) / (end - start);
    return { index, fraction };
  }
  return null;
}

/**
 * How much of the stretch after moment `index` the begin line covers (0–1): full behind the
 * current time, partial in its stretch, empty ahead of it and when there's no current time.
 */
export function stretchFill(position: DayPosition | null, index: number): number {
  if (!position || index > position.index) return 0;
  return index < position.index ? 1 : position.fraction;
}

/**
 * Which of `count` moments a scroll progress (0–1) highlights. The ends of the range land on the
 * first and last moment, so both can be reached.
 */
export function highlightIndex(progress: number, count: number): number {
  if (count <= 0) return 0;
  const clamped = Math.min(Math.max(progress, 0), 1);
  return Math.round(clamped * (count - 1));
}
