import { z } from 'zod';

import { Slug, text } from './primitives';

export const Amenity = z.object({
  id: Slug,
  name: text(1, 40, 'Name'),
  description: text(1, 160, 'Description'),
  /** Lucide icon name in kebab-case, e.g. `wifi`. */
  icon: Slug,
});
export type Amenity = z.infer<typeof Amenity>;
