import { Fraunces, Geist, Geist_Mono } from 'next/font/google';

// Self-hosted at build time by next/font, with metric-adjusted fallbacks so swapping in the
// web font causes no layout shift (docs/04-design-system.md §3). The CSS variables feed the
// --font-display / --font-sans / --font-mono theme tokens in tokens.css.

export const displayFont = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap',
  variable: '--font-display-face',
});

export const sansFont = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans-face',
});

export const monoFont = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-face',
});

export const fontVariables = [displayFont.variable, sansFont.variable, monoFont.variable].join(' ');
