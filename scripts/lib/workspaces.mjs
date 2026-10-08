import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Every package.json in the repo: the root plus apps/* and packages/*. */
export function workspaceManifests(root) {
  const dirs = [root];
  for (const group of ['apps', 'packages']) {
    const groupDir = join(root, group);
    let entries = [];
    try {
      entries = readdirSync(groupDir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const dir = join(groupDir, entry);
      if (statSync(dir).isDirectory()) dirs.push(dir);
    }
  }
  return dirs.flatMap((dir) => {
    const file = join(dir, 'package.json');
    try {
      return [{ file, manifest: JSON.parse(readFileSync(file, 'utf8')) }];
    } catch {
      return [];
    }
  });
}

/** Recursively lists files under `dir`, skipping build output and dependencies. */
export function listFiles(dir) {
  const skip = new Set(['node_modules', 'dist', '.next', '.turbo', 'coverage']);
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    if (skip.has(entry.name)) return [];
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}
