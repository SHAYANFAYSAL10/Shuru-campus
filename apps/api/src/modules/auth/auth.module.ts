import { Module } from '@nestjs/common';

import { AdminGuard } from './admin.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AdminGuard],
  // Admin-config routes use AdminGuard, which needs AuthService.
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}
