import { type InquiryAccepted, type InquiryCreate } from '@campus/contracts';

export interface InquiriesRepository {
  /** Records the inquiry. Phase 1 logs a redacted summary and stores nothing. */
  create(inquiry: InquiryCreate): Promise<InquiryAccepted>;
}
export const INQUIRIES_REPOSITORY = Symbol('INQUIRIES_REPOSITORY');
