'use client';

import { CalendarDays, Clock, Sun } from 'lucide-react';
import { useState } from 'react';

import { Chip } from '@/components/ui/chip';
import { SegmentedControl, type SegmentedOption } from '@/components/ui/segmented-control';

type Period = 'hour' | 'day' | 'week' | 'month';

const PERIODS: readonly SegmentedOption<Period>[] = [
  { value: 'hour', label: 'Hourly' },
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

const ICON_PERIODS: readonly SegmentedOption<'hour' | 'day' | 'month'>[] = [
  { value: 'hour', label: 'Hourly', icon: Clock },
  { value: 'day', label: 'Daily', icon: Sun },
  { value: 'month', label: 'Monthly', icon: CalendarDays },
];

export function SegmentedDemo() {
  const [period, setPeriod] = useState<Period>('month');
  const [compact, setCompact] = useState<'hour' | 'day' | 'month'>('day');
  return (
    <div className="flex flex-col items-start gap-6">
      <SegmentedControl
        legend="Billing period"
        options={PERIODS}
        value={period}
        onValueChange={setPeriod}
      />
      <SegmentedControl
        legend="Billing period, small with icons only"
        options={ICON_PERIODS}
        value={compact}
        onValueChange={setCompact}
        size="sm"
        iconOnly
      />
    </div>
  );
}

const FILTERS = ['All', 'Workspace', 'Meeting rooms', 'Events'] as const;

export function ChipDemo() {
  const [active, setActive] = useState<(typeof FILTERS)[number]>('All');
  return (
    <div className="flex flex-wrap gap-3" role="group" aria-label="Filter photos">
      {FILTERS.map((filter) => (
        <Chip
          key={filter}
          selected={active === filter}
          onClick={() => {
            setActive(filter);
          }}
        >
          {filter}
        </Chip>
      ))}
    </div>
  );
}
