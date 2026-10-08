#!/usr/bin/env node
// Brand guard (docs/11-implementation-plan.md → T0.8): the default brand name may only be
// written in packages/contracts/src/seed/. Everything else reads it from config.
import { readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { listFiles } from './lib/workspaces.mjs';

export const BRAND_PATTERN = /shuru|শুরু/i;

const TEXT_EXTENSIONS = /\.(ts|tsx|js|mjs|cjs|jsx|json|css|md|mdx|html|txt|svg)$/;

/** Directories checked, relative to the repo root. `apps/*` is expanded. */
export function scannedDirs(root, appNames) {
  return [...appNames.map((app) => join(root, 'apps', app, 'src')), join(root, 'apps/web/content')];
}

/** @returns {{ line: number; text: string }[]} */
export function findBrandLiterals(source) {
  return source
    .split('\n')
    .flatMap((text, i) => (BRAND_PATTERN.test(text) ? [{ line: i + 1, text: text.trim() }] : []));
}

export function run(root, appNames) {
  const problems = [];
  for (const dir of scannedDirs(root, appNames)) {
    for (const file of listFiles(dir).filter((f) => TEXT_EXTENSIONS.test(f))) {
      for (const hit of findBrandLiterals(readFileSync(file, 'utf8'))) {
        problems.push(`${relative(root, file).split(sep).join('/')}:${hit.line}  ${hit.text}`);
      }
    }
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const { readdirSync } = await import('node:fs');
  const apps = readdirSync(join(root, 'apps'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const problems = run(root, apps);
  if (problems.length > 0) {
    console.error('✖ Hard-coded brand name found (check-brand-literals):\n');
    for (const p of problems) console.error(`  • ${p}`);
    console.error(
      '\nThe brand is configuration, not code. Use brand.name / brand.shortName / brand.legalName:' +
        '\n  – Server Components: const brand = await getBrand()   (src/lib/api)' +
        '\n  – Client components: const brand = useBrand()' +
        '\n  – Legal MDX: <Brand field="legalName" />' +
        '\nDefaults live only in packages/contracts/src/seed/brand.ts. See docs/03-architecture.md → "Brand configuration".',
    );
    process.exit(1);
  }
  console.log('✔ check-brand-literals: no hard-coded brand name in apps.');
}
