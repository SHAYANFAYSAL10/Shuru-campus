import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { InquiryCreate, type InquiryAccepted } from '@campus/contracts';

import { RateLimit } from '#src/common/throttling.js';
import { ZodValidationPipe } from '#src/common/zod-validation.pipe.js';

import { InquiriesService } from './inquiries.service.js';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @RateLimit('inquiry')
  submit(
    @Body(new ZodValidationPipe(InquiryCreate))
    inquiry: InquiryCreate,
  ): Promise<InquiryAccepted> {
    return this.inquiries.submit(inquiry);
  }
}
