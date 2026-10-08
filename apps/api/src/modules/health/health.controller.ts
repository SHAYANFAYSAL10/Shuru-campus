import { Controller, Get, Inject } from '@nestjs/common';

import { type HealthResponse } from '@campus/contracts';

import { APP_CONFIG, type AppConfig } from '#src/config/app-config.js';

const startedAt = Date.now();

@Controller('health')
export class HealthController {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  @Get()
  get(): HealthResponse {
    return {
      status: 'ok',
      version: this.config.version,
      dataSource: this.config.env.DATA_SOURCE,
      uptimeS: Math.floor((Date.now() - startedAt) / 1000),
    };
  }
}
