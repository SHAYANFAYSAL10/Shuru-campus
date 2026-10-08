import { type Amenity } from '../schemas/amenity';

/**
 * Source: docs/02-content.md → Amenities (11). Icons are Lucide names.
 * TODO(client): descriptions are draft copy (the reference site lists names only); review.
 */
export const amenitiesSeed: readonly Amenity[] = [
  { id: 'wifi', name: 'Wi-Fi', description: 'Internet up to 40 Mbps.', icon: 'wifi' },
  {
    id: 'projector-tv',
    name: 'Projector / TV',
    description: 'Present from your laptop.',
    icon: 'projector',
  },
  {
    id: 'meeting-room',
    name: 'Meeting Room',
    description: 'Rooms for 3, 6 or 10 people.',
    icon: 'users',
  },
  { id: 'locker', name: 'Locker', description: 'Keep your things safe.', icon: 'lock-keyhole' },
  {
    id: 'silent-room',
    name: 'Silent Room',
    description: 'A quiet room for focused work.',
    icon: 'volume-off',
  },
  { id: 'cafe', name: 'Café', description: 'Food and drinks on site.', icon: 'coffee' },
  {
    id: 'timeout-zone',
    name: 'Timeout Zone',
    description: 'Step away from the desk.',
    icon: 'sofa',
  },
  { id: 'lunch', name: 'Lunch', description: 'Lunch available on site.', icon: 'utensils' },
  {
    id: 'print-copy-scan',
    name: 'Print / Copy / Scan',
    description: 'Office essentials, on hand.',
    icon: 'printer',
  },
  {
    id: 'tea-coffee',
    name: 'Unlimited Tea & Coffee',
    description: 'As many cups as the day needs.',
    icon: 'cup-soda',
  },
  {
    id: 'front-desk',
    name: 'Front Desk',
    description: 'A friendly face to help.',
    icon: 'concierge-bell',
  },
];
