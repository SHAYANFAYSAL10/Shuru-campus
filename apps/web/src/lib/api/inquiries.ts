import 'server-only';

import { InquiryAccepted, type InquiryCreate } from '@campus/contracts';

import { apiFetch } from '@/lib/api/client';

/** A visitor is waiting on the button, but the API may be slow to wake: longer than a read. */
export const INQUIRY_TIMEOUT_MS = 8000;

export interface PostInquiryOptions {
  /**
   * The visitor's `X-Forwarded-For` chain, passed on so the API rate-limits the visitor and not
   * the web server (its `TRUST_PROXY` decides which hops to believe).
   */
  forwardedFor?: string;
}

/** `POST /inquiries`: validated and logged by the API, not stored (Phase 1). */
export function postInquiry(inquiry: InquiryCreate, { forwardedFor }: PostInquiryOptions = {}) {
  return apiFetch('/inquiries', InquiryAccepted, {
    method: 'POST',
    body: inquiry,
    timeoutMs: INQUIRY_TIMEOUT_MS,
    ...(forwardedFor ? { headers: { 'x-forwarded-for': forwardedFor } } : {}),
  });
}
