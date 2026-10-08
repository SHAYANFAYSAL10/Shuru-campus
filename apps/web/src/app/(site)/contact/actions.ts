'use server';

import { headers } from 'next/headers';

import { getSiteSettings, postInquiry } from '@/lib/api';
import { formValues, type InquiryFormState } from '@/lib/inquiry-form';
import { submitInquiry } from '@/lib/inquiry-submit';

/**
 * Sends the contact page's inquiry. The one path for every visitor: with JS the form calls it
 * after checking the fields in the browser; without JS the form posts to it and the page renders
 * again with the result (the progressive-enhancement fallback of docs/05 → Contact).
 */
export async function sendInquiry(
  _previous: InquiryFormState,
  data: FormData,
): Promise<InquiryFormState> {
  // A page open from before the form was switched off can still post: say so, keep the values.
  const site = await getSiteSettings();
  if (!site.features.inquiryForm) {
    return {
      status: 'error',
      values: formValues(data),
      message: 'We’re not taking inquiries through the form right now. Call or email us instead.',
    };
  }

  const forwardedFor = (await headers()).get('x-forwarded-for') ?? undefined;
  return submitInquiry(data, (inquiry) =>
    postInquiry(inquiry, forwardedFor ? { forwardedFor } : {}),
  );
}
