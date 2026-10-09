#!/usr/bin/env node
// Container entry point (apps/api/Dockerfile). Fills in the two secrets a fresh
// `docker compose up` doesn't have, then boots the API. Values set in the environment always win.
//   JWT_SECRET            → random, kept in $SECRETS_DIR so sessions survive restarts.
//   ADMIN_PASSWORD_HASH   → hash of a random password, printed once on the first start.
// The secrets are files, not data: Phase 1 still has no database.
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { argon2id, hash } from 'argon2';

const dir = process.env.SECRETS_DIR ?? '/data';

/** The stored value at `name`, or `create()`'s value written there first (owner-only). */
async function persisted(name, create) {
  const file = join(dir, name);
  if (existsSync(file)) return readFileSync(file, 'utf8').trim();
  const value = await create();
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, `${value}\n`, { mode: 0o600 });
  return value;
}

process.env.JWT_SECRET ||= await persisted('jwt-secret', () =>
  randomBytes(48).toString('base64url'),
);

process.env.ADMIN_PASSWORD_HASH ||= await persisted('admin-password-hash', async () => {
  const password = randomBytes(12).toString('base64url');
  process.stdout.write(
    [
      '',
      '  ┌─────────────────────────────────────────────────────────────┐',
      '  │ Admin sign-in created (shown only on this first start)      │',
      `  │   email:    ${(process.env.ADMIN_EMAIL ?? '').padEnd(48)}│`,
      `  │   password: ${password.padEnd(48)}│`,
      '  │ Set ADMIN_PASSWORD_HASH in .env to choose your own.         │',
      '  └─────────────────────────────────────────────────────────────┘',
      '',
      '',
    ].join('\n'),
  );
  return hash(password, { type: argon2id });
});

await import('../dist/main.js');
