import { z } from 'zod';

import { SeedError, uniqueBy, validateSeed } from './seed.js';

describe('validateSeed', () => {
  const Item = z.object({ id: z.string().min(1), order: z.int() });

  it('returns the parsed value', () => {
    expect(validateSeed('item', Item, { id: 'a', order: 1 })).toEqual({ id: 'a', order: 1 });
  });

  it('throws a SeedError listing every problem with its path', () => {
    const run = () => validateSeed('item', z.array(Item), [{ id: '', order: 1.5 }]);
    expect(run).toThrow(SeedError);
    expect(run).toThrow(/^Invalid item seed data:/);
    expect(run).toThrow(/0\.id: /);
    expect(run).toThrow(/0\.order: /);
  });

  it('labels root-level problems', () => {
    expect(() => validateSeed('item', Item, null)).toThrow(/\(root\): /);
  });

  it('rejects duplicate keys with uniqueBy', () => {
    const List = uniqueBy(z.array(Item), (i) => i.id, 'IDs must be unique.');
    expect(() =>
      validateSeed('item', List, [
        { id: 'a', order: 0 },
        { id: 'a', order: 1 },
      ]),
    ).toThrow(/IDs must be unique/);
  });
});
