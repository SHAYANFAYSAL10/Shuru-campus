import { z } from 'zod';

import { Email } from '@campus/contracts';

const DURATION_UNITS = { s: 1, m: 60, h: 3600, d: 86_400 } as const;

/** `30s`, `15m`, `8h`, `7d` → seconds. */
const Duration = z
  .string()
  .regex(/^\d+[smhd]$/, { error: 'Use a number followed by s, m, h or d, e.g. 8h.' })
  .transform((value) => {
    const unit = value.slice(-1) as keyof typeof DURATION_UNITS;
    return Number(value.slice(0, -1)) * DURATION_UNITS[unit];
  })
  .refine((seconds) => seconds > 0, { error: 'Must be longer than zero.' });

/** Comma-separated list of exact browser origins, e.g. `http://localhost:3000`. */
const OriginList = z
  .string({ error: 'Required, e.g. http://localhost:3000.' })
  .transform((value) =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  )
  .pipe(
    z
      .array(
        z.url({ protocol: /^https?$/ }).refine((url) => new URL(url).origin === url, {
          error: 'Use a bare origin like https://example.com (no path or trailing slash).',
        }),
      )
      .min(1, { error: 'List at least one origin.' }),
  );

const Limit = z.coerce.number().int().positive();

/**
 * The API's environment (docs/03-architecture.md → Environment variables). Parsed once at
 * boot; the app refuses to start when it doesn't validate.
 */
export const Env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  WEB_ORIGINS: OriginList,
  JWT_SECRET: z
    .string({ error: 'Required. Generate one with the command in apps/api/.env.example.' })
    .refine((s) => Buffer.byteLength(s, 'utf8') >= 32, {
      error: 'Must be at least 32 bytes. Generate one with the command in apps/api/.env.example.',
    }),
  JWT_TTL: Duration.default(8 * 3600),
  ADMIN_EMAIL: z
    .string({ error: 'Required: the admin sign-in email.' })
    .pipe(Email)
    .transform((e) => e.toLowerCase()),
  ADMIN_PASSWORD_HASH: z
    .string({ error: "Required. Generate it with `npm run admin:hash -- 'a-strong-password'`." })
    .startsWith('$argon2id$', {
      error:
        "Must be an argon2id hash. Generate it with `npm run admin:hash -- 'a-strong-password'`.",
    }),
  // Phase 1 has no database (scripts/check-no-db.mjs enforces this literal).
  DATA_SOURCE: z.literal('memory').default('memory'),
  BRAND_SEED: z.string().trim().min(1).optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
  /**
   * Express `trust proxy`: which hops may set `X-Forwarded-For`. The web app proxies the
   * browser's requests, so rate limits must key on the forwarded client IP.
   */
  TRUST_PROXY: z.string().trim().min(1).default('loopback'),
  THROTTLE_DEFAULT_LIMIT: Limit.default(120),
  THROTTLE_LOGIN_LIMIT: Limit.default(5),
  THROTTLE_INQUIRY_LIMIT: Limit.default(5),
});
export type EnvInput = z.input<typeof Env>;
export type Env = z.output<typeof Env>;
