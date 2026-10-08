import { type Plan } from '@campus/contracts';

export interface PlansRepository {
  /** Every plan, ordered by `order`. */
  findAll(): Promise<Plan[]>;
  findBySlug(slug: string): Promise<Plan | null>;
}
export const PLANS_REPOSITORY = Symbol('PLANS_REPOSITORY');
