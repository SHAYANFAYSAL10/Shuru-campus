import { describe, expect, it } from 'vitest';

import { defaultBrand } from '@campus/contracts';

import { manifestoStatements } from '@/lib/manifesto';

describe('manifestoStatements', () => {
  it('has a statement for every default pillar, in order', () => {
    const statements = manifestoStatements(defaultBrand.pillars);
    expect(statements.map((s) => s.pillar)).toEqual(defaultBrand.pillars);
    for (const { rest } of statements) {
      expect(rest).toMatch(/^[a-z].*\.$/);
    }
  });

  it('matches pillars whatever their case, keeping the brand’s spelling', () => {
    expect(manifestoStatements([' enrich ', 'EMPOWER']).map((s) => s.pillar)).toEqual([
      'enrich',
      'EMPOWER',
    ]);
  });

  it('leaves out pillars it has no statement for', () => {
    expect(manifestoStatements(['Focus', 'Enhance']).map((s) => s.pillar)).toEqual(['Enhance']);
    expect(manifestoStatements(['Focus'])).toEqual([]);
  });
});
