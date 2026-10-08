import { type DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { AllExceptionsFilter } from './common/all-exceptions.filter.js';
import { CacheControlInterceptor } from './common/cache-control.js';
import { type LoggerOptions, pinoHttpOptions } from './common/logger.js';
import { type AppConfig } from './config/app-config.js';
import { ConfigModule } from './config/config.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { SiteModule } from './modules/site/site.module.js';

@Module({})
export class AppModule {
  static forRoot(config: AppConfig, logger: LoggerOptions = {}): DynamicModule {
    const pinoHttp = pinoHttpOptions(config, logger);
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot(config),
        LoggerModule.forRoot({ pinoHttp: logger.stream ? [pinoHttp, logger.stream] : pinoHttp }),
        HealthModule,
        SiteModule,
      ],
      providers: [
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_INTERCEPTOR, useClass: CacheControlInterceptor },
      ],
    };
  }
}
