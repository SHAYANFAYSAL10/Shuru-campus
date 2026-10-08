import { nextChange, type OpeningHours } from '@campus/contracts';

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** `09:00` → `9:00`. */
function displayTime(time: string): string {
  return time.replace(/^0(\d)/, '$1');
}

export interface OpenStatusText {
  open: boolean;
  label: string;
  detail: string | undefined;
}

/** "Open now · until 19:00", "Closed · opens 9:00", "Closed · opens Sat 9:00" (Dhaka time). */
export function openStatusText(hours: OpeningHours, now: Date): OpenStatusText {
  const change = nextChange(hours, now);
  if (!change) return { open: false, label: 'Closed', detail: undefined };

  const day = hours.weekly.find((d) => d.day === change.weekday);
  if (change.isOpen) {
    return {
      open: true,
      label: 'Open now',
      detail: day?.close ? `until ${displayTime(day.close)}` : undefined,
    };
  }
  const time = day?.open ? displayTime(day.open) : '';
  const when = change.dayOffset === 0 ? time : `${WEEKDAY[change.weekday] ?? ''} ${time}`;
  return { open: false, label: 'Closed', detail: `opens ${when}` };
}
