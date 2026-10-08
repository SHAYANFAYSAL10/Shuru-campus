import { Module } from '@nestjs/common';

import { InquiriesController } from './inquiries.controller.js';
import { INQUIRIES_REPOSITORY } from './inquiries.repository.js';
import { InquiriesService } from './inquiries.service.js';
import { LoggingInquiriesRepository } from './logging-inquiries.repository.js';

@Module({
  controllers: [InquiriesController],
  providers: [
    InquiriesService,
    { provide: INQUIRIES_REPOSITORY, useFactory: () => new LoggingInquiriesRepository() },
  ],
})
export class InquiriesModule {}
