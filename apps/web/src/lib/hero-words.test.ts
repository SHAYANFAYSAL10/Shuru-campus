import { describe, expect, it } from 'vitest';

import {
  HERO_SENTENCE,
  HERO_WORDS,
  INITIAL_WORD_CYCLE,
  nextWord,
  wordSlot,
  type WordCycleState,
} from '@/lib/hero-words';

describe('hero words', () => {
  it('starts from the word the page is written around', () => {
    expect(HERO_WORDS[0]).toBe('startup');
    expect(HERO_SENTENCE).toBe('Your startup begins here.');
    expect(new Set(HERO_WORDS).size).toBe(HERO_WORDS.length);
  });

  it('moves through every word and wraps round to the first', () => {
    let state = INITIAL_WORD_CYCLE;
    const seen: number[] = [];
    for (const _ of HERO_WORDS) {
      state = nextWord(state, HERO_WORDS.length);
      seen.push(state.current);
    }
    expect(seen).toEqual([1, 2, 3, 0]);
    expect(state.previous).toBe(HERO_WORDS.length - 1);
  });

  it('stays put with nothing to change to', () => {
    expect(nextWord(INITIAL_WORD_CYCLE, 1)).toBe(INITIAL_WORD_CYCLE);
  });

  it('marks the current word, the one leaving and the ones waiting', () => {
    const state: WordCycleState = { current: 2, previous: 1 };
    expect([0, 1, 2, 3].map((i) => wordSlot(i, state))).toEqual([
      'waiting',
      'leaving',
      'current',
      'waiting',
    ]);
    expect(wordSlot(1, INITIAL_WORD_CYCLE)).toBe('waiting');
  });
});
