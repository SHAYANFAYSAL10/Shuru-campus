import { MotionProvider } from '@/components/motion/motion-provider';
import { fontVariables } from '@/styles/fonts';

import type { ReactNode } from 'react';

import '@/styles/globals.css';

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
