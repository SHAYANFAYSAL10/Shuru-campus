import { BeginLine } from '@/components/motion/begin-line';
import { duration, staggerDelay } from '@/styles/motion';

import type { ReactNode } from 'react';

/** One word sliding up out of its mask on first paint, from CSS alone, `index` steps into the stagger. */
function Word({ index, children }: { index: number; children: ReactNode }) {
  return (
    <span className="mask-line">
      <span
        className="inline-block animate-mask-up motion-reduce:animate-none"
        style={{ animationDelay: `${staggerDelay(index)}ms` }}
      >
        {children}
      </span>
    </span>
  );
}

/**
 * "Your startup *begins* here." (docs/05-pages-and-interactions.md → Home #1). The words rise in
 * on first paint and the begin line draws under the italic emphasis as they settle (B2), all from
 * CSS, so it plays without JS and shows at rest under reduced motion. Screen readers get the
 * sentence once. T6.1 cycles the word after "Your".
 */
export function HeroHeadline({ id }: { id: string }) {
  return (
    // 20ch: the display measure (B1).
    <h1 id={id} className="max-w-[20ch] type-display text-fg">
      <span className="sr-only">Your startup begins here.</span>
      <span aria-hidden="true">
        <Word index={0}>Your</Word> <Word index={1}>startup</Word>{' '}
        <span className="inline-flex flex-col">
          <Word index={2}>
            <em>begins</em>
          </Word>
          {/* em-based: clears the descender of the display face at every fluid size. */}
          <BeginLine draw="mount" delay={duration.slow} className="mt-[0.14em]" />
        </span>{' '}
        <Word index={3}>here.</Word>
      </span>
    </h1>
  );
}
