import { Controller, Get, HttpStatus, Param, Put, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';

import {
  type AdminConfig,
  FeaturesUpdate,
  Plan,
  PLAN_SLUGS,
  type PreviewSaveResult,
  SiteSettings,
} from '@campus/contracts';

import { ApiException } from '#src/common/api-exception.js';
import { ApiErrors, ApiJson, ApiJsonBody } from '#src/common/openapi.js';
import { ZodBody } from '#src/common/zod-validation.pipe.js';
import { AdminGuard } from '#src/modules/auth/admin.guard.js';

import { AdminConfigService } from './admin-config.service.js';

/** `202` while saves are previews (Phase 1), `200` once they persist (docs/06-api.md). */
function respond(res: Response, result: PreviewSaveResult): PreviewSaveResult {
  res.status(result.persisted ? HttpStatus.OK : HttpStatus.ACCEPTED);
  return result;
}

const PREVIEW = 'Phase 1: valid, but not persisted (`persisted: false`).';

@Controller('admin/config')
@UseGuards(AdminGuard)
@ApiTags('admin')
@ApiCookieAuth()
@ApiErrors(401)
export class AdminConfigController {
  constructor(private readonly config: AdminConfigService) {}

  @Get()
  @ApiJson(200, 'AdminConfig')
  get(): Promise<AdminConfig> {
    return this.config.get();
  }

  @Put('site')
  @ApiJsonBody('SiteSettings')
  @ApiJson(202, 'PreviewSaveResult', { description: PREVIEW })
  @ApiErrors(400, 403)
  async saveSite(
    @ZodBody(SiteSettings) site: SiteSettings,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PreviewSaveResult> {
    return respond(res, await this.config.save({ kind: 'site', site }));
  }

  @Put('plans/:slug')
  @ApiParam({ name: 'slug', enum: PLAN_SLUGS })
  @ApiJsonBody('Plan')
  @ApiJson(202, 'PreviewSaveResult', { description: PREVIEW })
  @ApiErrors(400, 403, 404)
  async savePlan(
    @Param('slug') slug: string,
    @ZodBody(Plan) plan: Plan,
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
  @ApiJsonBody('FeaturesUpdate')
  @ApiJson(202, 'PreviewSaveResult', { description: PREVIEW })
  @ApiErrors(400, 403)
  async saveFeatures(
    @ZodBody(FeaturesUpdate) features: FeaturesUpdate,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PreviewSaveResult> {
    return respond(res, await this.config.save({ kind: 'features', features }));
  }
}
