import { describe, expect, it, vi } from 'vitest';

import { reportError } from '@/lib/report-error';

describe('reportError', () => {
  it('logs the error tagged with its digest', () => {
    const log = vi.fn();
    const error = Object.assign(new Error('boom'), { digest: '12345' });
    reportError(error, log);
    expect(log).toHaveBeenCalledWith('Render error (digest 12345)', error);
  });

  it('logs client errors, which have no digest', () => {
    const log = vi.fn();
    const error = new Error('boom');
    reportError(error, log);
    expect(log).toHaveBeenCalledWith('Render error', error);
  });

  it('logs to the console by default', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    reportError(new Error('boom'));
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
