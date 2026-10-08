import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';

import { findBrandLiterals, run } from '../check-brand-literals.mjs';

describe('findBrandLiterals', () => {
  it('matches the brand case-insensitively, in Latin and Bangla', () => {
    const src = ['const a = 1;', '<h1>Welcome to SHURU</h1>', "const b = 'শুরু';"].join('\n');
    assert.deepEqual(
      findBrandLiterals(src).map((h) => h.line),
      [2, 3],
    );
  });

  it('matches the brand inside domains and handles', () => {
    assert.equal(findBrandLiterals('info@shurucampus.com').length, 1);
  });
});

describe('run', () => {
  let root;
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  const setup = () => {
    root = mkdtempSync(join(tmpdir(), 'brand-'));
    mkdirSync(join(root, 'apps/web/src'), { recursive: true });
    mkdirSync(join(root, 'apps/web/content/legal'), { recursive: true });
    mkdirSync(join(root, 'packages/contracts/src/seed'), { recursive: true });
  };

  it('flags apps/*/src and apps/web/content, but not the seed folder', () => {
    setup();
    writeFileSync(join(root, 'apps/web/src/hero.tsx'), 'export const t = "Shuru";\n');
    writeFileSync(join(root, 'apps/web/content/legal/terms.mdx'), 'Shuru Campus Ltd.\n');
    writeFileSync(join(root, 'packages/contracts/src/seed/brand.ts'), "name: 'Shuru Campus'\n");
    assert.deepEqual(run(root, ['web']), [
      'apps/web/src/hero.tsx:1  export const t = "Shuru";',
      'apps/web/content/legal/terms.mdx:1  Shuru Campus Ltd.',
    ]);
  });

  it('passes when apps read the brand from config', () => {
    setup();
    writeFileSync(join(root, 'apps/web/src/hero.tsx'), 'export const t = brand.name;\n');
    assert.deepEqual(run(root, ['web']), []);
  });
});
