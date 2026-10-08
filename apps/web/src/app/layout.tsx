import { MotionProvider } from '@/components/motion/motion-provider';
import { BrandProvider } from '@/components/providers/brand-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ANNOUNCEMENT_BOOT_SCRIPT } from '@/lib/announcement';
import { getBrand } from '@/lib/api';
import { fontVariables } from '@/styles/fonts';

import type { ReactNode } from 'react';

import '@/styles/globals.css';

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const brand = await getBrand();
  return (
    // next-themes (theme class) and the announcement script set attributes on <html> before
    // hydration.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Hides a dismissed announcement before first paint (components/layout/announcement-bar.tsx). */}
        <script dangerouslySetInnerHTML={{ __html: ANNOUNCEMENT_BOOT_SCRIPT }} />
      </head>
      <body>
        <BrandProvider brand={brand}>
          <ThemeProvider>
            <MotionProvider>{children}</MotionProvider>
            <Toaster />
          </ThemeProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
