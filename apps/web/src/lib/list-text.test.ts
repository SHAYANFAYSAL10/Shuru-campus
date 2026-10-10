import { describe, expect, it } from 'vitest';

import { listText, lowerFirst } from '@/lib/list-text';

describe('lowerFirst', () => {
  it('lower-cases the first letter of a word', () => {
    expect(lowerFirst('Up to 40 Mbps internet')).toBe('up to 40 Mbps internet');
    expect(lowerFirst('Start-ups')).toBe('start-ups');
  });

  it('leaves acronyms, numbers and empty text alone', () => {
    expect(lowerFirst('TV room')).toBe('TV room');
    expect(lowerFirst('3 people')).toBe('3 people');
    expect(lowerFirst('A')).toBe('a');
    expect(lowerFirst('')).toBe('');
  });
});

describe('listText', () => {
  it('joins items into running text', () => {
    expect(listText([])).toBe('');
    expect(listText(['a'])).toBe('a');
    expect(listText(['a', 'b'])).toBe('a and b');
    expect(listText(['a', 'b', 'c'])).toBe('a, b and c');
  });

  it('offers alternatives with "or"', () => {
    expect(listText(['a', 'b'], 'or')).toBe('a or b');
    expect(listText(['a', 'b', 'c'], 'or')).toBe('a, b or c');
  });
});
