import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { defaultBrand } from '@campus/contracts';

import { testEnv } from '#test/fixtures/env.js';

import { ConfigError, loadConfig } from './app-config.js';

function problemsFor(source: Record<string, string | undefined>): string[] {
  try {
    loadConfig(source);
  } catch (error) {
    if (error instanceof ConfigError) return error.problems;
    throw error;
  }
  return [];
}

function writeJson(value: unknown): string {
  const file = join(mkdtempSync(join(tmpdir(), 'brand-')), 'brand.json');
  writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value));
  return file;
}

describe('loadConfig', () => {
  it('accepts a complete environment and applies defaults', () => {
    const config = loadConfig(testEnv());
    expect(config.env).toMatchObject({
      PORT: 4000,
      JWT_TTL: 8 * 3600,
      DATA_SOURCE: 'memory',
      WEB_ORIGINS: ['http://localhost:3000'],
      THROTTLE_LOGIN_LIMIT: 5,
    });
    expect(config.brand).toEqual(defaultBrand);
    expect(config.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(config.isProduction).toBe(false);
  });

  it('fails without JWT_SECRET', () => {
    expect(problemsFor(testEnv({ JWT_SECRET: undefined }))).toEqual([
      expect.stringMatching(/^JWT_SECRET: Required/),
    ]);
  });

  it('fails with a JWT_SECRET shorter than 32 bytes', () => {
    expect(problemsFor(testEnv({ JWT_SECRET: 'x'.repeat(31) }))).toEqual([
      expect.stringMatching(/^JWT_SECRET: Must be at least 32 bytes/),
    ]);
    expect(problemsFor(testEnv({ JWT_SECRET: 'x'.repeat(32) }))).toEqual([]);
  });

  it('treats an empty value (as copied from .env.example) as missing', () => {
    expect(problemsFor(testEnv({ ADMIN_PASSWORD_HASH: '' }))).toEqual([
      expect.stringMatching(/^ADMIN_PASSWORD_HASH: Required.*admin:hash/),
    ]);
  });

  it('fails without ADMIN_PASSWORD_HASH, or with a non-argon2id hash', () => {
    expect(problemsFor(testEnv({ ADMIN_PASSWORD_HASH: undefined }))).toHaveLength(1);
    expect(problemsFor(testEnv({ ADMIN_PASSWORD_HASH: '$2b$10$bcrypt' }))).toEqual([
      expect.stringMatching(/^ADMIN_PASSWORD_HASH: Must be an argon2id hash/),
    ]);
  });

  it('reports every problem at once', () => {
    const problems = problemsFor({ NODE_ENV: 'staging' });
    expect(problems.map((p) => p.split(':')[0])).toEqual(
      expect.arrayContaining([
        'NODE_ENV',
        'WEB_ORIGINS',
        'JWT_SECRET',
        'ADMIN_EMAIL',
        'ADMIN_PASSWORD_HASH',
      ]),
    );
  });

  it('only accepts the memory data source', () => {
    expect(problemsFor(testEnv({ DATA_SOURCE: 'postgres' }))).toEqual([
      expect.stringMatching(/^DATA_SOURCE:/),
    ]);
  });

  it('parses origin lists and rejects origins with paths', () => {
    const config = loadConfig(
      testEnv({ WEB_ORIGINS: 'http://localhost:3000, https://campus.example' }),
    );
    expect(config.env.WEB_ORIGINS).toEqual(['http://localhost:3000', 'https://campus.example']);
    expect(problemsFor(testEnv({ WEB_ORIGINS: 'https://campus.example/' }))).toHaveLength(1);
    expect(problemsFor(testEnv({ WEB_ORIGINS: ' , ' }))).toHaveLength(1);
  });

  it('parses JWT_TTL durations', () => {
    expect(loadConfig(testEnv({ JWT_TTL: '15m' })).env.JWT_TTL).toBe(900);
    expect(loadConfig(testEnv({ JWT_TTL: '1d' })).env.JWT_TTL).toBe(86_400);
    expect(problemsFor(testEnv({ JWT_TTL: '8 hours' }))).toHaveLength(1);
    expect(problemsFor(testEnv({ JWT_TTL: '0h' }))).toHaveLength(1);
  });

  it('lower-cases ADMIN_EMAIL', () => {
    expect(loadConfig(testEnv({ ADMIN_EMAIL: 'Admin@Example.COM' })).env.ADMIN_EMAIL).toBe(
      'admin@example.com',
    );
  });

  describe('BRAND_SEED', () => {
    const acme = {
      name: 'Acme Works',
      shortName: 'Acme',
      legalName: 'Acme Works Ltd.',
      tagline: 'Work, together',
      subTagline: 'A place to begin',
      pillars: ['Focus'],
      logo: { kind: 'wordmark' },
    };

    it('replaces the default brand', () => {
      expect(loadConfig(testEnv({ BRAND_SEED: writeJson(acme) })).brand).toEqual(acme);
    });

    it('fails on a brand that does not match the schema', () => {
      expect(
        problemsFor(testEnv({ BRAND_SEED: writeJson({ ...acme, name: '', pillars: [] }) })),
      ).toEqual([
        expect.stringMatching(/BRAND_SEED .* → name: Brand name is required/),
        expect.stringMatching(/BRAND_SEED .* → pillars: Add at least one pillar/),
      ]);
    });

    it('fails on a missing file or invalid JSON', () => {
      expect(problemsFor(testEnv({ BRAND_SEED: join(tmpdir(), 'nope', 'brand.json') }))).toEqual([
        expect.stringMatching(/^BRAND_SEED .*ENOENT/),
      ]);
      expect(problemsFor(testEnv({ BRAND_SEED: writeJson('{ nope') }))).toEqual([
        expect.stringMatching(/^BRAND_SEED .*JSON/),
      ]);
    });
  });
});
