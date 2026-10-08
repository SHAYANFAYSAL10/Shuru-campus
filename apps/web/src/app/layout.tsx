import { headers } from 'next/headers';

import { MotionProvider } from '@/components/motion/motion-provider';
import { BrandProvider } from '@/components/providers/brand-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ANNOUNCEMENT_BOOT_SCRIPT } from '@/lib/announcement';
import { getBrand } from '@/lib/api';
import { siteMetadata, siteViewport } from '@/lib/metadata';
import { NONCE_HEADER } from '@/lib/security/csp';
import { fontVariables } from '@/styles/fonts';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import '@/styles/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata(await getBrand());
}

export const viewport: Viewport = siteViewport;

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const brand = await getBrand();
  // Set per request by src/proxy.ts; the CSP only runs inline scripts carrying it.
  const nonce = (await headers()).get(NONCE_HEADER) ?? undefined;
  return (
    // next-themes (theme class) and the announcement script set attributes on <html> before
    // hydration.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Hides a dismissed announcement before first paint (components/layout/announcement-bar.tsx).
            Browsers hide `nonce` from the DOM after parsing, hence the hydration opt-out. */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: ANNOUNCEMENT_BOOT_SCRIPT }}
        />
      </head>
      <body>
        <BrandProvider brand={brand}>
          <ThemeProvider nonce={nonce}>
            <MotionProvider>{children}</MotionProvider>
            <Toaster />
          </ThemeProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
