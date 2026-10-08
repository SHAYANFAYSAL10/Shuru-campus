import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { InquiryCreate, type InquiryAccepted } from '@campus/contracts';

import { ApiErrors, ApiJson, ApiJsonBody } from '#src/common/openapi.js';
import { RateLimit } from '#src/common/throttling.js';
import { ZodBody } from '#src/common/zod-validation.pipe.js';

import { InquiriesService } from './inquiries.service.js';

@Controller('inquiries')
@ApiTags('inquiries')
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @RateLimit('inquiry')
  @ApiJsonBody('InquiryCreate')
  @ApiJson(202, 'InquiryAccepted', { description: 'Accepted (Phase 1: logged, not stored).' })
  @ApiErrors(400, 403, 429)
  submit(
    @ZodBody(InquiryCreate)
    inquiry: InquiryCreate,
  ): Promise<InquiryAccepted> {
    return this.inquiries.submit(inquiry);
  }
}
