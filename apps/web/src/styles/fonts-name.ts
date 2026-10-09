import { Noto_Serif_Bengali } from 'next/font/google';

// The face for the brand name's original word on About (`brand.nameMeaning.word`, Bengali by
// default), which Fraunces has no glyphs for. Kept out of fonts.ts so only About loads it, and
// not preloaded: its @font-face carries the Bengali unicode-range, so browsers fetch it only
// when the word is Bengali. A word in another script falls through to the display face
// (--font-name in tokens.css).
export const nameFont = Noto_Serif_Bengali({
  subsets: ['bengali'],
  display: 'swap',
  preload: false,
  variable: '--font-name-face',
});
