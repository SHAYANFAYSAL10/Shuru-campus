#!/usr/bin/env node
// Prints the argon2id hash for ADMIN_PASSWORD_HASH (docs/07-admin.md).
//   npm run admin:hash -- 'a-strong-password'
//   printf '%s' 'a-strong-password' | npm run admin:hash   (keeps it out of shell history)
import { text } from 'node:stream/consumers';

import { argon2id, hash } from 'argon2';

const MIN_LENGTH = 12;

const password = process.argv[2] ?? (process.stdin.isTTY ? '' : await text(process.stdin));

if (password.length < MIN_LENGTH) {
  process.stderr.write(
    `✖ Use a password of at least ${MIN_LENGTH} characters.\n` +
      "  npm run admin:hash -- 'a-strong-password'\n",
  );
  process.exit(1);
}

// argon2's defaults are argon2id with m=65536 (64 MiB), t=3, p=4.
process.stdout.write(`${await hash(password, { type: argon2id })}\n`);
