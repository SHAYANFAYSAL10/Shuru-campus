import { describe, expect, it } from 'vitest';

import { HealthResponse } from './health';

describe('HealthResponse', () => {
  it('accepts a healthy payload', () => {
    expect(
      HealthResponse.safeParse({ status: 'ok', version: '0.1.0', dataSource: 'memory', uptimeS: 3 })
        .success,
    ).toBe(true);
  });

  it('rejects a non-memory data source', () => {
    expect(
      HealthResponse.safeParse({ status: 'ok', version: '0.1.0', dataSource: 'db', uptimeS: 3 })
        .success,
    ).toBe(false);
  });
});
