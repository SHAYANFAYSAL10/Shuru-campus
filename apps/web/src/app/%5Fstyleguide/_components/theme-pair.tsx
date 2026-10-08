import { type ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { type Theme } from '@/lib/color/contrast';

const THEMES: readonly Theme[] = ['light', 'dark'];

export interface ThemePairProps {
  /** Rendered once per theme. A function receives the theme it renders in. */
  children: ReactNode | ((theme: Theme) => ReactNode);
  className?: string;
}

/**
 * Renders its content twice, in a forced-light and a forced-dark panel (the `.light` / `.dark`
 * classes scope the tokens to the subtree). Side by side from xl, stacked below.
 */
export function ThemePair({ children, className }: ThemePairProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {THEMES.map((theme) => (
        <div
          key={theme}
          className={cn(
            theme,
            'min-w-0 rounded-lg border border-border bg-bg p-5 text-fg sm:p-8',
            className,
          )}
        >
          <p className="mb-6 type-eyebrow text-fg-subtle">{theme === 'light' ? 'Light' : 'Dark'}</p>
          {typeof children === 'function' ? children(theme) : children}
        </div>
      ))}
    </div>
  );
}
