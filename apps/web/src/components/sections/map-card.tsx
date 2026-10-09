import { ArrowUpRight, MapPin } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface MapCardProps {
  /** The Google Maps link from site settings. */
  href: string;
  className?: string;
}

// A street pattern in the 480×320 viewBox: no geography is implied, it only reads as "a map".
const MINOR_ROADS = [
  'M-20 70 H500',
  'M-20 250 H500',
  'M110 -20 V340',
  'M370 -20 V340',
  'M-20 160 H180',
  'M300 160 H500',
  'M240 -20 V90',
  'M240 230 V340',
];
const BLOCKS = [
  [16, 12, 78, 42],
  [126, 12, 98, 42],
  [256, 12, 98, 42],
  [386, 12, 78, 42],
  [16, 86, 78, 58],
  [16, 176, 78, 58],
  [386, 86, 78, 58],
  [386, 176, 78, 58],
  [16, 266, 78, 42],
  [126, 266, 98, 42],
  [256, 266, 98, 42],
  [386, 266, 78, 42],
] as const;

/**
 * The map on Home → Visit us and Contact: a light, token-colored illustration (it themes with the page and
 * costs no third-party request) with the pin at its center. The whole card links to Google Maps.
 * TODO(client): swap for a static map export of the real location once it's confirmed.
 */
export function MapCard({ href, className }: MapCardProps) {
  return (
    <a
      href={href}
      className={cn(
        'group relative block aspect-4/3 overflow-hidden rounded-lg border border-border bg-surface md:aspect-16/10',
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 480 320"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full transition-transform duration-slow ease-out group-hover:scale-103 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      >
        <g className="fill-bg-alt">
          {BLOCKS.map(([x, y, w, h]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={6} />
          ))}
        </g>
        <path
          d="M300 120 C330 100 360 112 352 140 C346 160 318 166 300 150 C288 140 288 128 300 120 Z"
          className="fill-info-subtle"
        />
        <g className="fill-none stroke-border" strokeWidth={8} strokeLinecap="round">
          {MINOR_ROADS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        {/* The main road, running corner to corner past the pin. */}
        <path
          d="M-20 330 C120 230 160 180 240 160 S380 60 500 -10"
          className="fill-none stroke-border-strong"
          strokeWidth={14}
          strokeLinecap="round"
        />
      </svg>

      {/* The pin, centered on the main road. */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="relative grid size-12 place-items-center rounded-full border-2 border-surface bg-brand-surface text-on-brand shadow-raise">
          <MapPin aria-hidden="true" className="size-6" strokeWidth={1.5} />
        </span>
      </span>

      <span className="absolute inset-x-4 bottom-4 flex">
        <span className="inline-flex min-h-hit items-center gap-1.5 rounded-full border border-border bg-surface px-4 font-medium text-fg shadow-raise">
          Open in Google Maps
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 shrink-0 transition-transform duration-fast ease-out group-hover:translate-x-px group-hover:-translate-y-px motion-reduce:transition-none"
            strokeWidth={1.5}
          />
        </span>
      </span>
    </a>
  );
}
