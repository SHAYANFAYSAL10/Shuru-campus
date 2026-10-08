'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { isThemeChoice, type ThemeChoice } from '@/components/providers/theme-provider';
import { SegmentedControl, type SegmentedOption } from '@/components/ui/segmented-control';
import { useHydrated } from '@/lib/hooks/use-hydrated';

const OPTIONS: readonly SegmentedOption<ThemeChoice>[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export interface ThemeToggleProps {
  /** Icons only (header). With labels for roomier places such as menus. */
  iconOnly?: boolean;
  className?: string;
}

/** The three-way theme switch. Nothing is selected until the stored choice is known. */
export function ThemeToggle({ iconOnly = true, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const value = hydrated && isThemeChoice(theme) ? theme : undefined;

  return (
    <SegmentedControl
      legend="Theme"
      hideLegend
      options={OPTIONS}
      value={value}
      onValueChange={setTheme}
      size="sm"
      iconOnly={iconOnly}
      className={className}
    />
  );
}
