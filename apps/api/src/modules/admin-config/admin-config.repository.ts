import {
  type AdminConfig,
  type FeaturesUpdate,
  type Plan,
  type SiteSettings,
} from '@campus/contracts';

/** One admin save, already validated against its contract schema. */
export type ConfigChange =
  | { kind: 'site'; site: SiteSettings }
  | { kind: 'plan'; plan: Plan }
  | { kind: 'features'; features: FeaturesUpdate };

/** Thrown by `update()` while there is no database (Phase 1, docs/07-admin.md). */
export class NotPersistedError extends Error {
  constructor(readonly change: ConfigChange['kind']) {
    super(`Config changes (${change}) can't be saved until a database is connected.`);
    this.name = 'NotPersistedError';
  }
}

export interface AdminConfigRepository {
  get(): Promise<AdminConfig>;
  /** Phase 1 always throws `NotPersistedError`. */
  update(change: ConfigChange): Promise<void>;
}
export const ADMIN_CONFIG_REPOSITORY = Symbol('ADMIN_CONFIG_REPOSITORY');
