import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';

import { findBannedDependencies, findInvalidDataSourceSchemas, run } from '../check-no-db.mjs';

describe('findBannedDependencies', () => {
  it('flags banned packages in any dependency field', () => {
    const hits = findBannedDependencies({
      dependencies: { pg: '^8', zod: '^4' },
      devDependencies: { prisma: '^6' },
    });
    assert.deepEqual(hits, [
      { pkg: 'pg', field: 'dependencies' },
      { pkg: 'prisma', field: 'devDependencies' },
    ]);
  });

  it('allows unrelated packages that merely contain a banned name', () => {
    assert.deepEqual(
      findBannedDependencies({ dependencies: { 'pg-format-docs': '1', pino: '9' } }),
      [],
    );
  });
});

describe('findInvalidDataSourceSchemas', () => {
  it('accepts memory-only literals', () => {
    assert.deepEqual(findInvalidDataSourceSchemas(`DATA_SOURCE: z.literal('memory'),`), []);
    assert.deepEqual(
      findInvalidDataSourceSchemas(`DATA_SOURCE: z.literal("memory").default("memory"),`),
      [],
    );
  });

  it('rejects enums or strings that allow other sources', () => {
    assert.equal(findInvalidDataSourceSchemas(`DATA_SOURCE: z.enum(['memory', 'db']),`).length, 1);
    assert.equal(findInvalidDataSourceSchemas(`DATA_SOURCE: z.string(),`).length, 1);
  });
});

describe('run', () => {
  let root;
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('reports a workspace that adds pg', () => {
    root = mkdtempSync(join(tmpdir(), 'no-db-'));
    writeFileSync(join(root, 'package.json'), '{}');
    mkdirSync(join(root, 'apps/api/src'), { recursive: true });
    writeFileSync(
      join(root, 'apps/api/package.json'),
      JSON.stringify({ dependencies: { pg: '8' } }),
    );
    assert.deepEqual(run(root), ['apps/api/package.json: "pg" in dependencies']);
  });

  it('passes a clean repo', () => {
    root = mkdtempSync(join(tmpdir(), 'no-db-'));
    writeFileSync(join(root, 'package.json'), '{}');
    mkdirSync(join(root, 'apps/api/src'), { recursive: true });
    writeFileSync(join(root, 'apps/api/src/env.ts'), `DATA_SOURCE: z.literal('memory'),\n`);
    assert.deepEqual(run(root), []);
  });
});
