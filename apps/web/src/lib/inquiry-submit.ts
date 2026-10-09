import { InquiryCreate, toErrorDetails, type InquiryAccepted } from '@campus/contracts';

import { type ApiResult } from '@/lib/api/result';
import {
  fieldErrorsFrom,
  failureMessage,
  formValues,
  toInquiryInput,
  type InquiryFormState,
} from '@/lib/inquiry-form';

export type SendInquiry = (inquiry: InquiryCreate) => Promise<ApiResult<InquiryAccepted>>;

/**
 * What the inquiry server action does with a submitted form: validate it against the contract
 * (the browser's checks can be skipped, and without JS there are none), send it, and describe
 * the outcome for the form. Never throws, so a failure never replaces the page with an error.
 */
export async function submitInquiry(data: FormData, send: SendInquiry): Promise<InquiryFormState> {
  const values = formValues(data);
  const parsed = InquiryCreate.safeParse(toInquiryInput(values));
  if (!parsed.success) {
    const { fieldErrors } = fieldErrorsFrom(toErrorDetails(parsed.error));
    return { status: 'invalid', values, fieldErrors };
  }

  const result = await send(parsed.data);
  if (result.ok) {
    const inquiry = parsed.data;
    return {
      status: 'success',
      receipt: {
        name: inquiry.name,
        email: inquiry.email,
        ...(values.interest ? { interest: values.interest.trim() } : {}),
        ...(inquiry.preferredDate ? { preferredDate: inquiry.preferredDate } : {}),
        ...(inquiry.teamSize ? { teamSize: inquiry.teamSize } : {}),
      },
    };
  }

  const { error } = result;
  if (error.kind === 'http' && error.status === 400 && error.details.length > 0) {
    const { fieldErrors, unmatched } = fieldErrorsFrom(error.details);
    if (unmatched.length === 0) return { status: 'invalid', values, fieldErrors };
  }
  return { status: 'error', values, message: failureMessage(error) };
}
