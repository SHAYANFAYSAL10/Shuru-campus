import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fail, ok } from '@/lib/api/result';
import { submitInquiry, type SendInquiry } from '@/lib/inquiry-submit';

const ACCEPTED = { id: 'inq_1', receivedAt: '2026-10-09T04:00:00.000Z' };

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = {
  name: ' Nadia Rahman ',
  email: 'nadia@example.com',
  phone: '',
  interest: 'meeting-room:big',
  preferredDate: '2026-10-12',
  teamSize: '4',
  message: 'Looking for a room on Monday.',
  website: '',
};

describe('submitInquiry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-09T10:00:00+06:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends the contract body and thanks the visitor with what they asked about', async () => {
    const send = vi.fn<SendInquiry>(() => Promise.resolve(ok(ACCEPTED)));

    const state = await submitInquiry(formData(valid), send);

    expect(send).toHaveBeenCalledWith({
      name: 'Nadia Rahman',
      email: 'nadia@example.com',
      phone: undefined,
      planSlug: 'meeting-room',
      rateId: 'big',
      preferredDate: '2026-10-12',
      teamSize: 4,
      message: 'Looking for a room on Monday.',
      website: '',
    });
    expect(state).toEqual({
      status: 'success',
      receipt: {
        name: 'Nadia Rahman',
        email: 'nadia@example.com',
        interest: 'meeting-room:big',
        preferredDate: '2026-10-12',
        teamSize: 4,
      },
    });
  });

  it('leaves out what was not given', async () => {
    const state = await submitInquiry(
      formData({ ...valid, interest: '', preferredDate: '', teamSize: '' }),
      () => Promise.resolve(ok(ACCEPTED)),
    );
    expect(state).toEqual({
      status: 'success',
      receipt: { name: 'Nadia Rahman', email: 'nadia@example.com' },
    });
  });

  it('checks the fields itself and sends nothing when they fail', async () => {
    const send = vi.fn<SendInquiry>();
    const data = formData({ ...valid, email: 'nadia@', interest: 'penthouse', message: 'Hi' });

    const state = await submitInquiry(data, send);

    expect(send).not.toHaveBeenCalled();
    expect(state).toMatchObject({
      status: 'invalid',
      values: { email: 'nadia@', interest: 'penthouse' },
      fieldErrors: {
        email: 'Enter a valid email address.',
        interest: expect.any(String) as unknown,
        message: 'Message needs at least 10 characters.',
      },
    });
  });

  it('puts the API’s field errors on their fields', async () => {
    const state = await submitInquiry(formData(valid), () =>
      Promise.resolve(
        fail({
          kind: 'http',
          status: 400,
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          details: [{ path: 'preferredDate', message: 'Pick today or a later date.' }],
        }),
      ),
    );
    expect(state).toMatchObject({
      status: 'invalid',
      fieldErrors: { preferredDate: 'Pick today or a later date.' },
    });
  });

  it('keeps the values and explains a failed send', async () => {
    const state = await submitInquiry(formData(valid), () =>
      Promise.resolve(fail({ kind: 'network', message: 'ECONNREFUSED' })),
    );
    expect(state).toEqual({
      status: 'error',
      values: valid,
      message: 'We couldn’t send that just now. Try again in a moment, or call or email us.',
    });
  });

  it('treats a 400 it cannot place on a field as a failed send', async () => {
    const state = await submitInquiry(formData(valid), () =>
      Promise.resolve(
        fail({
          kind: 'http',
          status: 400,
          code: 'VALIDATION_FAILED',
          message: 'Bad body',
          details: [{ path: '', message: 'Body must be JSON.' }],
        }),
      ),
    );
    expect(state).toMatchObject({ status: 'error' });
  });
});
