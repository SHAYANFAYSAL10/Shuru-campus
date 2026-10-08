import { MotionProvider } from '@/components/motion/motion-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { fontVariables } from '@/styles/fonts';

import type { ReactNode } from 'react';

import '@/styles/globals.css';

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // next-themes sets the theme class on <html> before hydration.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <MotionProvider>{children}</MotionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
