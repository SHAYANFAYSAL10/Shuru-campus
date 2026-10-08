import { randomUUID } from 'node:crypto';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { type InquiryAccepted, type InquiryCreate, isHoneypotTripped } from '@campus/contracts';

import { INQUIRIES_REPOSITORY, type InquiriesRepository } from './inquiries.repository.js';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger('Inquiries');

  constructor(@Inject(INQUIRIES_REPOSITORY) private readonly inquiries: InquiriesRepository) {}

  /**
   * Accepts an inquiry. A filled honeypot gets the same response a person would, so bots
   * can't tell, but the inquiry is dropped.
   */
  submit(inquiry: InquiryCreate): Promise<InquiryAccepted> {
    if (isHoneypotTripped(inquiry)) {
      this.logger.warn({ msg: 'Inquiry dropped: honeypot filled' });
      return Promise.resolve({ id: randomUUID(), receivedAt: new Date().toISOString() });
    }
    return this.inquiries.create(inquiry);
  }
}
