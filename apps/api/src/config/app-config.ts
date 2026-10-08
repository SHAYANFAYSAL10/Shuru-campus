import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { z } from 'zod';

import { Brand, defaultBrand } from '@campus/contracts';

import { Env } from './env.schema.js';

/** Everything the app needs at runtime, resolved once at boot. */
export interface AppConfig {
  env: Env;
  /** The brand served by `GET /site`: `defaultBrand`, or the `BRAND_SEED` override. */
  brand: Brand;
  version: string;
  isProduction: boolean;
}

export const APP_CONFIG = Symbol('APP_CONFIG');

export class ConfigError extends Error {
  constructor(readonly problems: string[]) {
    super(`Invalid API configuration:\n${problems.map((p) => `  • ${p}`).join('\n')}`);
    this.name = 'ConfigError';
  }
}

function formatIssues(error: z.ZodError, prefix = ''): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.map(String).join('.');
    return `${prefix}${path || '(root)'}: ${issue.message}`;
  });
}

function loadBrand(path: string | undefined): Brand {
  if (path === undefined) return defaultBrand;
  const label = `BRAND_SEED (${path})`;
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(resolve(path), 'utf8'));
  } catch (error) {
    throw new ConfigError([`${label}: ${error instanceof Error ? error.message : String(error)}`]);
  }
  const parsed = Brand.safeParse(raw);
  if (!parsed.success) throw new ConfigError(formatIssues(parsed.error, `${label} → `));
  return parsed.data;
}

function readVersion(): string {
  // src/config → apps/api (dist/config at runtime: same depth).
  const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
    version?: unknown;
  };
  return typeof pkg.version === 'string' ? pkg.version : '0.0.0';
}

/**
 * Validates the environment and resolves the config. Throws `ConfigError` listing every
 * problem, so the operator can fix them in one pass.
 */
export function loadConfig(source: Record<string, string | undefined>): AppConfig {
  // Treat empty values (e.g. `JWT_SECRET=` from .env.example) as unset.
  const cleaned = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== ''));
  const parsed = Env.safeParse(cleaned);
  if (!parsed.success) throw new ConfigError(formatIssues(parsed.error));
  const env = parsed.data;
  return {
    env,
    brand: loadBrand(env.BRAND_SEED),
    version: readVersion(),
    isProduction: env.NODE_ENV === 'production',
  };
}
