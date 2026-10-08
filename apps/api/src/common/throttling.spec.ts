import { trustProxySetting } from '#src/app.factory.js';
import { loadConfig } from '#src/config/app-config.js';
import { testEnv } from '#test/fixtures/env.js';

import { retryMessage, throttlerOptions } from './throttling.js';

describe('throttlerOptions', () => {
  it('builds per-minute default, login and inquiry throttlers from the env', () => {
    const options = throttlerOptions(
      loadConfig(
        testEnv({
          THROTTLE_DEFAULT_LIMIT: '100',
          THROTTLE_LOGIN_LIMIT: '5',
          THROTTLE_INQUIRY_LIMIT: '7',
        }),
      ),
    );
    if (Array.isArray(options)) throw new Error('Expected the object form');
    expect(options.setHeaders).toBe(false);
    expect(options.throttlers.map(({ name, limit, ttl }) => ({ name, limit, ttl }))).toEqual([
      { name: 'default', limit: 100, ttl: 60_000 },
      { name: 'login', limit: 5, ttl: 60_000 },
      { name: 'inquiry', limit: 7, ttl: 60_000 },
    ]);
  });
});

describe('retryMessage', () => {
  it('says how long to wait', () => {
    expect(retryMessage(1)).toBe('Too many requests. Please try again in 1 second.');
    expect(retryMessage(42)).toBe('Too many requests. Please try again in 42 seconds.');
  });
});

describe('trustProxySetting', () => {
  it('maps booleans, hop counts and subnet lists', () => {
    expect(trustProxySetting('true')).toBe(true);
    expect(trustProxySetting('false')).toBe(false);
    expect(trustProxySetting('2')).toBe(2);
    expect(trustProxySetting('loopback, 10.0.0.0/8')).toBe('loopback, 10.0.0.0/8');
  });
});
