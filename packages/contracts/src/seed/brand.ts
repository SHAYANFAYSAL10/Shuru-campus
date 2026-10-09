import { type Brand } from '../schemas/brand';

/**
 * Default brand. **The only place in the codebase where the brand name is written.**
 * Everything else reads `brand.name` / `brand.shortName` / `brand.legalName` (getBrand() /
 * useBrand()). To rename: edit this file, or point the API's `BRAND_SEED` at a JSON file.
 * Source: docs/02-content.md → Brand.
 */
export const defaultBrand: Brand = {
  name: 'Shuru Campus',
  shortName: 'Shuru',
  legalName: 'Shuru Campus Ltd.',
  tagline: 'Shared Workspace & Beyond',
  subTagline: 'Designed for Work Empowerment, Enhancement & Enrichment',
  pillars: ['Empower', 'Enhance', 'Enrich'],
  nameMeaning: { word: 'শুরু', language: 'Bangla', lang: 'bn', meaning: 'beginning' },
  // TODO(client): logo files and brand guidelines (docs/09-roadmap.md #2). Wordmark until supplied.
  logo: { kind: 'wordmark' },
};
