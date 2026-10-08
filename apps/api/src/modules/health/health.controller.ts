import { Controller, Get } from '@nestjs/common';

import { type HealthResponse } from '@campus/contracts';

const startedAt = Date.now();

@Controller('health')
export class HealthController {
  @Get()
  get(): HealthResponse {
    return {
      status: 'ok',
      version: process.env.npm_package_version ?? '0.0.0',
      dataSource: 'memory',
      uptimeS: Math.floor((Date.now() - startedAt) / 1000),
    };
  }
}
