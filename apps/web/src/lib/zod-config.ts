import { z } from 'zod';

/**
 * Zod 4 probes for `new Function` to decide whether to JIT-compile object parsers. The CSP has no
 * `'unsafe-eval'` (lib/security/csp.ts), so in the browser the probe is blocked and reported as a
 * violation. Jitless parsing skips the probe; client-side schemas are small, so speed is unchanged.
 * Imported for its side effect by a client module on every page (BrandProvider).
 */
z.config({ jitless: true });
