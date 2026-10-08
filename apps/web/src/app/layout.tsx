import { fontVariables } from '@/styles/fonts';

import type { ReactNode } from 'react';

import '@/styles/globals.css';

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
