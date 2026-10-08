import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { verify } from 'argon2';

const script = fileURLToPath(new URL('../scripts/admin-hash.mjs', import.meta.url));

function run(args: string[], input?: string) {
  return spawnSync(process.execPath, [script, ...args], { input, encoding: 'utf8' });
}

describe('npm run admin:hash', () => {
  it('prints an argon2id hash of the argument', async () => {
    const { status, stdout } = run(['a-strong-password']);
    expect(status).toBe(0);
    const hash = stdout.trim();
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=65536,p=4,t=3\$/);
    expect(await verify(hash, 'a-strong-password')).toBe(true);
  });

  it('reads the password from stdin', async () => {
    const { status, stdout } = run([], 'piped-password-123');
    expect(status).toBe(0);
    expect(await verify(stdout.trim(), 'piped-password-123')).toBe(true);
  });

  it('refuses a short password', () => {
    const { status, stdout, stderr } = run(['short']);
    expect(status).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toMatch(/at least 12 characters/);
  });
});
