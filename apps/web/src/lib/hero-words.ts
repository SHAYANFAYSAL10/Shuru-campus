// The hero's changing word (docs/04-design-system.md §6, signature moment 1): "Your ___ *begins*
// here." The first word is the one the page is written around: it's in the SSR HTML, the
// accessible name and the no-JS page, and it's the word the cycle starts from.

export const HERO_WORDS = ['startup', 'big idea', 'Monday', 'next chapter'] as const;

export type HeroWord = (typeof HERO_WORDS)[number];

/** The sentence screen readers get, always with the first word: the cycle is decoration. */
export const HERO_SENTENCE = `Your ${HERO_WORDS[0]} begins here.`;

/**
 * Where a word stands in the cycle:
 * - `current`: in view.
 * - `leaving`: sliding out, after being current.
 * - `waiting`: out of view, ready below the mask for its turn.
 */
export type WordSlot = 'current' | 'leaving' | 'waiting';

export interface WordCycleState {
  current: number;
  /** The word that was current before; `null` until the first change. */
  previous: number | null;
}

export const INITIAL_WORD_CYCLE: WordCycleState = { current: 0, previous: null };

/** Moves on to the next word, wrapping round to the first after the last. */
export function nextWord(state: WordCycleState, count: number): WordCycleState {
  if (count < 2) return state;
  return { current: (state.current + 1) % count, previous: state.current };
}

export function wordSlot(index: number, state: WordCycleState): WordSlot {
  if (index === state.current) return 'current';
  if (index === state.previous) return 'leaving';
  return 'waiting';
}
