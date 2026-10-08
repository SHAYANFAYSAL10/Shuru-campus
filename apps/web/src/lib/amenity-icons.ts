import {
  ConciergeBell,
  Coffee,
  CupSoda,
  LockKeyhole,
  type LucideIcon,
  type LucideProps,
  Printer,
  Projector,
  Sofa,
  Sparkles,
  Users,
  Utensils,
  VolumeOff,
  Wifi,
} from 'lucide-react';
import { createElement } from 'react';

import { type Amenity } from '@campus/contracts';

/**
 * Lucide icons by the kebab-case name an amenity stores (`Amenity.icon`). Listed one by one so
 * only these ship, not the whole icon set. Add a name here before using it in the seed or admin.
 */
const AMENITY_ICONS: Readonly<Record<string, LucideIcon>> = {
  wifi: Wifi,
  projector: Projector,
  users: Users,
  'lock-keyhole': LockKeyhole,
  'volume-off': VolumeOff,
  coffee: Coffee,
  sofa: Sofa,
  utensils: Utensils,
  printer: Printer,
  'cup-soda': CupSoda,
  'concierge-bell': ConciergeBell,
};

/** Shown for an icon name this map doesn't know yet, so a tile never renders without one. */
export const FALLBACK_AMENITY_ICON: LucideIcon = Sparkles;

export function amenityIcon(icon: Amenity['icon']): LucideIcon {
  return AMENITY_ICONS[icon] ?? FALLBACK_AMENITY_ICON;
}

/** Renders an amenity's icon by name (a lookup, so it's an element, not a component made in render). */
export function AmenityGlyph({ icon, ...props }: LucideProps & { icon: Amenity['icon'] }) {
  return createElement(amenityIcon(icon), props);
}
