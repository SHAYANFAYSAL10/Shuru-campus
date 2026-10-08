'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ReactNode } from 'react';

export const THEMES = ['system', 'light', 'dark'] as const;
export type ThemeChoice = (typeof THEMES)[number];

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/**
 * System / Light / Dark (A7). next-themes injects a blocking script that sets `.light` or
 * `.dark` on <html> before first paint, so there's no flash of the wrong theme; the choice is
 * kept in localStorage. Without JS, `:root` follows the OS through `color-scheme`. `nonce` is the
 * request's CSP nonce (src/proxy.ts), without which the script is blocked.
 */
export function ThemeProvider({ nonce, children }: { nonce?: string; children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
      storageKey="theme"
      nonce={nonce}
    >
      {children}
    </NextThemesProvider>
  );
}
