import { scrollText } from '@/styles/motion';

/** A run of text, optionally emphasized (`<em>`), as a statement is written. */
export interface ScrollTextPart {
  text: string;
  em?: boolean;
}

export interface ScrollWord {
  word: string;
  em: boolean;
  /** Where on the statement's `cover` timeline this word starts and finishes brightening (%). */
  from: number;
  to: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Splits a statement into words, each with its own stretch of the statement's scroll: they
 * brighten in reading order between `scrollText.start` and `scrollText.end`, each taking
 * `spread` words' worth, so the brightening runs along the line rather than a line at a time.
 */
export function scrollWords(parts: readonly ScrollTextPart[]): ScrollWord[] {
  const words = parts.flatMap(({ text, em = false }) =>
    text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, em })),
  );
  const step = (scrollText.end - scrollText.start) / Math.max(words.length, 1);

  return words.map(({ word, em }, i) => {
    const from = scrollText.start + i * step;
    return {
      word,
      em,
      from: round(from),
      to: round(Math.min(scrollText.end, from + step * scrollText.spread)),
    };
  });
}
