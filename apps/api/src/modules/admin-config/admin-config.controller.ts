import { Body, Controller, Get, HttpStatus, Param, Put, Res, UseGuards } from '@nestjs/common';
import { type Response } from 'express';

import {
  type AdminConfig,
  FeaturesUpdate,
  Plan,
  type PreviewSaveResult,
  SiteSettings,
} from '@campus/contracts';

import { ApiException } from '#src/common/api-exception.js';
import { ZodValidationPipe } from '#src/common/zod-validation.pipe.js';
import { AdminGuard } from '#src/modules/auth/admin.guard.js';

import { AdminConfigService } from './admin-config.service.js';

/** `202` while saves are previews (Phase 1), `200` once they persist (docs/06-api.md). */
function respond(res: Response, result: PreviewSaveResult): PreviewSaveResult {
  res.status(result.persisted ? HttpStatus.OK : HttpStatus.ACCEPTED);
  return result;
}

@Controller('admin/config')
@UseGuards(AdminGuard)
export class AdminConfigController {
  constructor(private readonly config: AdminConfigService) {}

  @Get()
  get(): Promise<AdminConfig> {
    return this.config.get();
  }

  @Put('site')
  async saveSite(
    @Body(new ZodValidationPipe(SiteSettings)) site: SiteSettings,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PreviewSaveResult> {
    return respond(res, await this.config.save({ kind: 'site', site }));
  }

  @Put('plans/:slug')
  async savePlan(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(Plan)) plan: Plan,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PreviewSaveResult> {
    if (plan.slug !== slug) {
      throw new ApiException('VALIDATION_FAILED', 'Some fields are invalid.', [
        { path: 'slug', message: "A plan's slug can't be changed." },
      ]);
    }
    return respond(res, await this.config.save({ kind: 'plan', plan }));
  }

  @Put('features')
  async saveFeatures(
    @Body(new ZodValidationPipe(FeaturesUpdate)) features: FeaturesUpdate,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PreviewSaveResult> {
    return respond(res, await this.config.save({ kind: 'features', features }));
  }
}
