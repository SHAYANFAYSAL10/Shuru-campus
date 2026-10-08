#!/usr/bin/env node
// Phase 1 guard (docs/11-implementation-plan.md → T0.7): no database, ORM or driver
// may be added, and DATA_SOURCE may only be `memory`. Removed in Phase 2.
import { readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { listFiles, workspaceManifests } from './lib/workspaces.mjs';

export const BANNED_PACKAGES = [
  'prisma',
  '@prisma/client',
  'drizzle-orm',
  'typeorm',
  '@nestjs/typeorm',
  'mongoose',
  '@nestjs/mongoose',
  'sequelize',
  'pg',
  'mysql2',
  'sqlite3',
  'better-sqlite3',
  '@neondatabase/serverless',
  'knex',
  'kysely',
];

const DEP_FIELDS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];

/** @returns {{ pkg: string; field: string }[]} */
export function findBannedDependencies(manifest) {
  return DEP_FIELDS.flatMap((field) =>
    Object.keys(manifest[field] ?? {})
      .filter((pkg) => BANNED_PACKAGES.includes(pkg))
      .map((pkg) => ({ pkg, field })),
  );
}

/**
 * Finds `DATA_SOURCE: z.…` definitions that accept anything other than `memory`.
 * Allowed: `z.literal('memory')`, optionally followed by `.default('memory')`.
 * @returns {string[]} offending definitions
 */
export function findInvalidDataSourceSchemas(source) {
  const defs = source.match(/DATA_SOURCE\s*:\s*z\.[^,\n]*/g) ?? [];
  const allowed =
    /^DATA_SOURCE\s*:\s*z\.literal\(\s*['"]memory['"]\s*\)(\.default\(\s*['"]memory['"]\s*\))?\s*$/;
  return defs.filter((def) => !allowed.test(def.trim()));
}

const toPosix = (p) => p.split(sep).join('/');

export function run(root) {
  const problems = [];
  for (const { file, manifest } of workspaceManifests(root)) {
    for (const { pkg, field } of findBannedDependencies(manifest)) {
      problems.push(`${toPosix(relative(root, file))}: "${pkg}" in ${field}`);
    }
  }
  for (const file of listFiles(join(root, 'apps/api/src')).filter((f) => f.endsWith('.ts'))) {
    for (const def of findInvalidDataSourceSchemas(readFileSync(file, 'utf8'))) {
      problems.push(
        `${toPosix(relative(root, file))}: DATA_SOURCE must be z.literal('memory'), found "${def.trim()}"`,
      );
    }
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const problems = run(root);
  if (problems.length > 0) {
    console.error('✖ Phase 1 has no database (check-no-db):\n');
    for (const p of problems) console.error(`  • ${p}`);
    console.error(
      '\nDatabases, ORMs and drivers arrive in Phase 2 as new repository implementations.' +
        '\nSee docs/11-implementation-plan.md (T0.7) and docs/03-architecture.md → "Phase 1: no database".',
    );
    process.exit(1);
  }
  console.log('✔ check-no-db: no database dependencies, DATA_SOURCE is memory-only.');
}
