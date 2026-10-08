import { type DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { AllExceptionsFilter } from './common/all-exceptions.filter.js';
import { CacheControlInterceptor } from './common/cache-control.js';
import { type LoggerOptions, pinoHttpOptions } from './common/logger.js';
import { OriginGuard } from './common/origin.guard.js';
import { ThrottlingModule } from './common/throttling.js';
import { type AppConfig } from './config/app-config.js';
import { ConfigModule } from './config/config.module.js';
import { AdminConfigModule } from './modules/admin-config/admin-config.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { InquiriesModule } from './modules/inquiries/inquiries.module.js';
import { PlansModule } from './modules/plans/plans.module.js';
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
        ThrottlingModule,
        HealthModule,
        SiteModule,
        PlansModule,
        InquiriesModule,
        AuthModule,
        AdminConfigModule,
      ],
      providers: [
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_GUARD, useClass: OriginGuard },
        { provide: APP_INTERCEPTOR, useClass: CacheControlInterceptor },
      ],
    };
  }
}
