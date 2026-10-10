'use client';

import { Pause, Play } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { BeginLine } from '@/components/motion/begin-line';
import { BeginLineHandoffSource } from '@/components/motion/begin-line-handoff';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/cn';
import {
  HERO_SENTENCE,
  HERO_WORDS,
  INITIAL_WORD_CYCLE,
  nextWord,
  wordSlot,
  type WordCycleState,
} from '@/lib/hero-words';
import { useHydrated } from '@/lib/hooks/use-hydrated';
import { duration, staggerDelay, wordCycle } from '@/styles/motion';

const MOUNT = 'animate-mask-up motion-reduce:animate-none';

/** One word sliding up out of its mask on first paint, from CSS alone, `index` steps into the stagger. */
function Word({ index, children }: { index: number; children: ReactNode }) {
  return (
    <span className="mask-line">
      <span
        className={cn('inline-block', MOUNT)}
        style={{ animationDelay: `${staggerDelay(index)}ms` }}
      >
        {children}
      </span>
    </span>
  );
}

/**
 * The changing word: every word in one grid cell, styled by its slot (`styles/word-cycle.css`).
 * The first one rises in with the rest of the headline until the first change.
 */
function WordSlot({ cycle, index }: { cycle: WordCycleState; index: number }) {
  return (
    <span className="mask-line">
      <span className="grid">
        {HERO_WORDS.map((word, i) => (
          <span
            key={word}
            data-word-slot={wordSlot(i, cycle)}
            className={cn(cycle.previous === null && i === cycle.current && MOUNT)}
            style={{ animationDelay: `${staggerDelay(index)}ms` }}
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Whether the page is in a visible tab. */
function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => {
      setVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return visible;
}

/**
 * "Your startup *begins* here." (docs/05-pages-and-interactions.md → Home #1). The words rise in
 * on first paint and the begin line draws under the italic emphasis as they settle (B2), all from
 * CSS, so it plays without JS and shows at rest under reduced motion. Once hydrated, "startup"
 * gives way in turn to the other `HERO_WORDS` (04 §6, signature moment 1). The cycle holds while
 * the pointer is on the headline, the pause button has focus, the headline is off screen or the
 * tab is hidden, and stops for good with the pause button (WCAG 2.2.2). Reduced motion: the words
 * crossfade. Screen readers get the sentence once, with its first word. Leaving through the nav,
 * the begin line flies up to become the nav underline (signature moment 2).
 */
export function HeroHeadline({ id }: { id: string }) {
  const hydrated = useHydrated();
  const pageVisible = usePageVisible();
  const [cycle, setCycle] = useState(INITIAL_WORD_CYCLE);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusHeld, setFocusHeld] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const running = !paused && !hovered && !focusHeld && onScreen && pageVisible;

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) setOnScreen(entry.isIntersecting);
    });
    observer.observe(heading);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Restarts on every change and every resume, so each word gets its full turn.
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setCycle((state) => nextWord(state, HERO_WORDS.length));
    }, wordCycle.interval);
    return () => {
      window.clearTimeout(timer);
    };
  }, [running, cycle]);

  return (
    // The pause button sits under the headline: beside it, it would float at the end of the
    // slot's reserved width, away from the word it controls.
    <div className="flex flex-col items-start gap-4">
      {/* 20ch: the display measure (B1). */}
      <h1
        ref={headingRef}
        id={id}
        className="max-w-[20ch] type-display text-fg"
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setHovered(true);
        }}
        onPointerLeave={() => {
          setHovered(false);
        }}
      >
        <span className="sr-only">{HERO_SENTENCE}</span>
        <span aria-hidden="true">
          {/* The changing word ends the first line, so its slot's spare width never shows. */}
          <span className="block">
            <Word index={0}>Your</Word> <WordSlot cycle={cycle} index={1} />
          </span>
          <span className="inline-flex flex-col">
            <Word index={2}>
              <em>begins</em>
            </Word>
            {/* em-based: clears the descender of the display face at every fluid size. */}
            <BeginLineHandoffSource className="mt-[0.14em]">
              <BeginLine draw="mount" delay={duration.slow} />
            </BeginLineHandoffSource>
          </span>{' '}
          <Word index={3}>here.</Word>
        </span>
      </h1>
      {/* Takes its space from the start but only shows once it works; without JS nothing moves. */}
      <IconButton
        label="Pause changing word"
        icon={paused ? Play : Pause}
        aria-pressed={paused}
        variant="secondary"
        size="sm"
        className={cn(!hydrated && 'invisible')}
        onFocus={() => {
          setFocusHeld(true);
        }}
        onBlur={() => {
          setFocusHeld(false);
        }}
        onClick={() => {
          // Resuming is explicit, so it isn't held up by the focus that pressed it.
          if (paused) setFocusHeld(false);
          setPaused(!paused);
        }}
      />
    </div>
  );
}
