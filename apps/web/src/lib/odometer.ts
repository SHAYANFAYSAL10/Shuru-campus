/** One character of an odometer: a rolling digit or a fixed separator (",", "−"). */
export type OdometerColumn =
  | {
      key: string;
      kind: 'digit';
      digit: number;
      /** Which digit this is, counting from the ones (0); the roll staggers leftward by it. */
      rank: number;
    }
  | { key: string; kind: 'static'; char: string };

const DIGIT = /^[0-9]$/;

/**
 * Splits a formatted figure ("10,000") into columns keyed by their place from the right, so the
 * ones stay the ones when the figure grows or shrinks ("2,800" → "10,000" rolls each place and
 * only adds the ten-thousands). Returned left to right, in reading order.
 */
export function odometerColumns(text: string): OdometerColumn[] {
  // Figures are ASCII digits, separators and a sign: one code point per character.
  const chars = Array.from(text);
  let rank = chars.filter((char) => DIGIT.test(char)).length;
  return chars.map((char, index): OdometerColumn => {
    const key = `p${String(chars.length - 1 - index)}`;
    if (!DIGIT.test(char)) return { key, kind: 'static', char };
    rank -= 1;
    return { key, kind: 'digit', digit: Number(char), rank };
  });
}
