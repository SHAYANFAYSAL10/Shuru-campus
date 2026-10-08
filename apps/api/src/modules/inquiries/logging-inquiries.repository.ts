import { randomUUID } from 'node:crypto';

import { Logger } from '@nestjs/common';

import { type InquiryAccepted, type InquiryCreate } from '@campus/contracts';

import { type InquiriesRepository } from './inquiries.repository.js';

/**
 * What an inquiry log line may contain: no name, email, phone or message text
 * (CLAUDE.md §4: never log full PII).
 */
export function inquirySummary(id: string, inquiry: InquiryCreate) {
  return {
    inquiryId: id,
    planSlug: inquiry.planSlug ?? null,
    rateId: inquiry.rateId ?? null,
    teamSize: inquiry.teamSize ?? null,
    preferredDate: inquiry.preferredDate ?? null,
    hasPhone: inquiry.phone !== undefined,
    messageLength: inquiry.message.length,
  };
}

/** Phase 1: inquiries are validated and logged (redacted), never stored. */
export class LoggingInquiriesRepository implements InquiriesRepository {
  private readonly logger = new Logger('Inquiries');

  create(inquiry: InquiryCreate): Promise<InquiryAccepted> {
    const id = randomUUID();
    this.logger.log({ msg: 'Inquiry received', inquiry: inquirySummary(id, inquiry) });
    return Promise.resolve({ id, receivedAt: new Date().toISOString() });
  }
}
