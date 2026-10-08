import { Inject, Injectable } from '@nestjs/common';

import { type AdminConfig, type PreviewSaveResult } from '@campus/contracts';

import { ApiException } from '#src/common/api-exception.js';
import { PLANS_REPOSITORY, type PlansRepository } from '#src/modules/plans/plans.repository.js';

import {
  ADMIN_CONFIG_REPOSITORY,
  type AdminConfigRepository,
  type ConfigChange,
  NotPersistedError,
} from './admin-config.repository.js';

/** Shown as the info toast after a preview save (docs/07-admin.md → Save behavior). */
export const PREVIEW_SAVE_MESSAGE =
  "Looks good. Changes are valid but weren't saved (preview mode).";
export const SAVED_MESSAGE = 'Changes saved.';

@Injectable()
export class AdminConfigService {
  constructor(
    @Inject(ADMIN_CONFIG_REPOSITORY) private readonly config: AdminConfigRepository,
    @Inject(PLANS_REPOSITORY) private readonly plans: PlansRepository,
  ) {}

  get(): Promise<AdminConfig> {
    return this.config.get();
  }

  /**
   * Saves a validated change. Phase 1 can't persist, so the result says so
   * (`persisted: false`); the same contract carries `true` once a database exists.
   */
  async save(change: ConfigChange): Promise<PreviewSaveResult> {
    if (change.kind === 'plan') await this.assertPlanExists(change.plan.slug);
    try {
      await this.config.update(change);
      return { persisted: true, validated: true, message: SAVED_MESSAGE };
    } catch (error) {
      if (!(error instanceof NotPersistedError)) throw error;
      return { persisted: false, validated: true, message: PREVIEW_SAVE_MESSAGE };
    }
  }

  /** Plans can be edited, not created, from the console. */
  private async assertPlanExists(slug: string): Promise<void> {
    if (!(await this.plans.findBySlug(slug))) {
      throw new ApiException('NOT_FOUND', "We couldn't find that plan.");
    }
  }
}
