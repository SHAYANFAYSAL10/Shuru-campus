import { MotionProvider } from '@/components/motion/motion-provider';
import { BrandProvider } from '@/components/providers/brand-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { getBrand } from '@/lib/api';
import { fontVariables } from '@/styles/fonts';

import type { ReactNode } from 'react';

import '@/styles/globals.css';

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const brand = await getBrand();
  return (
    // next-themes sets the theme class on <html> before hydration.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
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
