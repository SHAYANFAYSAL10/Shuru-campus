'use client';

import { LazyMotion, MotionConfig } from 'motion/react';
import { type ReactNode } from 'react';

// Animation features (springs, layout, gestures) load after hydration as a separate chunk, so
// they never sit in a route's first-load JS. `strict` makes a stray full `motion.*` import throw;
// use `m.*` from `motion/react-m`.
const loadFeatures = () => import('@/components/motion/motion-features').then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {/* `user`: motion's own transforms and layout animations honor prefers-reduced-motion. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
