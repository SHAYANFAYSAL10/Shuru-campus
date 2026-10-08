import { z } from 'zod';

export const HealthResponse = z.object({
  status: z.literal('ok'),
  version: z.string(),
  dataSource: z.literal('memory'),
  uptimeS: z.number().int().nonnegative(),
});
export type HealthResponse = z.infer<typeof HealthResponse>;
