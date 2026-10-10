import { type CSSProperties, Fragment } from 'react';

import { cn } from '@/lib/cn';
import { type ScrollTextPart, scrollWords } from '@/lib/scroll-text';
import { scrollText } from '@/styles/motion';

export interface ScrollTextProps {
  parts: readonly ScrollTextPart[];
  className?: string;
}

/**
 * A statement whose words brighten from `fg-subtle` to `fg` in reading order as it scrolls up the
 * viewport, tied to the scroll position (05 → Home #2). It's CSS scroll-driven animation on the
 * paragraph's own view timeline (`styles/scroll-text.css`), so it's a Server Component: no JS,
 * no hydration, and nothing runs on scroll. Without support for scroll timelines, under reduced
 * motion, in forced colors, with more contrast or in print, every word is simply `fg`. The words
 * are plain inline spans, so it reads, selects and copies as the one sentence it is.
 */
export function ScrollText({ parts, className }: ScrollTextProps) {
  const words = scrollWords(parts);

  return (
    <p
      className={cn('scroll-text', className)}
      style={{ '--scroll-text-dim': scrollText.dim } as CSSProperties}
    >
      {words.map(({ word, em, from, to }, i) => {
        const style = { '--word-from': `${from}%`, '--word-to': `${to}%` } as CSSProperties;
        return (
          // Words repeat, so position is the only stable identity.
          <Fragment key={i}>
            {em ? (
              <em className="scroll-text-word" style={style}>
                {word}
              </em>
            ) : (
              <span className="scroll-text-word" style={style}>
                {word}
              </span>
            )}
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        );
      })}
    </p>
  );
}
