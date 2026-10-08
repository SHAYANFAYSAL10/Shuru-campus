import { type Plan } from '../schemas/plan';

// Source: docs/02-content.md → Plans & pricing. Prices are whole BDT.
// TODO(client): is "up to 40 Mbps" still accurate? (docs/09-roadmap.md #8)
const INTERNET = { title: 'Up to 40 Mbps internet' };
const TEA_COFFEE = { title: 'Unlimited tea & coffee' };
const PRINT = { title: 'Print, copy & scan' };

export const plansSeed: readonly Plan[] = [
  {
    slug: 'hot-desk',
    name: 'Hot Desk',
    summary: 'A designated hot desk by the hour or the day.',
    audience: ['Freelancers', 'Independent professionals', 'Travelling professionals'],
    rates: [
      { id: 'hourly', amountBdt: 100, unit: 'hour' },
      { id: 'daily', amountBdt: 650, unit: 'day' },
    ],
    features: [
      { title: 'Designated hot-desk seating' },
      { title: 'Silent Room & Timeout Zone access' },
      INTERNET,
      PRINT,
      TEA_COFFEE,
    ],
    imageId: 'plan-hot-desk',
    highlight: false,
    order: 0,
  },
  {
    slug: 'business-seating',
    name: 'Business Seating',
    summary: 'Your own designated seat, by the week or the month.',
    audience: ['Entrepreneurs', 'Business owners'],
    rates: [
      { id: 'weekly', amountBdt: 2800, unit: 'week' },
      { id: 'monthly', amountBdt: 10000, unit: 'month' },
    ],
    features: [
      { title: 'Designated seating space' },
      INTERNET,
      PRINT,
      TEA_COFFEE,
      { title: 'Locker' },
      { title: '1 hour free meeting room', detail: 'Per month' },
    ],
    imageId: 'plan-business-seating',
    // TODO(client): which plan should be featured? Design default until confirmed.
    highlight: true,
    order: 1,
  },
  {
    slug: 'executive-seating',
    name: 'Executive Seating',
    summary: 'A dedicated cubicle with storage and front desk service.',
    audience: ['Start-ups', 'Small companies'],
    rates: [
      { id: 'weekly', amountBdt: 4000, unit: 'week' },
      { id: 'monthly', amountBdt: 14000, unit: 'month' },
      // TODO(client): what does Premium add? (docs/09-roadmap.md #4) Shown as a separate rate
      // with no extra features until answered.
      { id: 'monthly-premium', label: 'Premium', amountBdt: 17000, unit: 'month' },
    ],
    features: [
      { title: 'Dedicated cubicle seating' },
      PRINT,
      INTERNET,
      TEA_COFFEE,
      { title: 'Cabinet' },
      { title: 'Complimentary locker' },
      { title: 'Complimentary front desk service' },
      { title: '2 hours free meeting room', detail: 'Per month' },
    ],
    imageId: 'plan-executive-seating',
    highlight: false,
    order: 2,
  },
  {
    slug: 'private-office',
    name: 'Private Office',
    summary: 'A dedicated office for teams of up to six.',
    audience: ['Satellite teams', 'Companies of 1–6 people'],
    // TODO(client): "1–6 people" is advertised but only 3/4/6 are priced (docs/09-roadmap.md #6).
    // UI shows these tiers plus "Other sizes: contact us".
    rates: [
      { id: 'three-people', label: '3 people', amountBdt: 40000, unit: 'month', capacity: 3 },
      { id: 'four-people', label: '4 people', amountBdt: 50000, unit: 'month', capacity: 4 },
      { id: 'six-people', label: '6 people', amountBdt: 60000, unit: 'month', capacity: 6 },
    ],
    features: [
      { title: 'Dedicated space' },
      { title: 'Flexible seating for 2–6' },
      INTERNET,
      { title: 'Print, fax & scan' },
      TEA_COFFEE,
      { title: 'Complimentary cabinet' },
      { title: 'Basic front desk service' },
    ],
    imageId: 'plan-private-office',
    highlight: false,
    order: 3,
  },
  {
    slug: 'meeting-room',
    name: 'Meeting Room',
    summary: 'Rooms for 3 to 10 people, booked by the hour.',
    audience: ['Conferences', 'Board meetings'],
    rates: [
      { id: 'big', label: 'Big', amountBdt: 1000, unit: 'hour', capacity: 10 },
      { id: 'small', label: 'Small', amountBdt: 500, unit: 'hour', capacity: 6 },
      { id: 'mini', label: 'Mini', amountBdt: 300, unit: 'hour', capacity: 3 },
    ],
    features: [
      { title: 'Snacks & lunch ordering' },
      INTERNET,
      { title: 'Smart TV multimedia' },
      TEA_COFFEE,
      { title: 'Basic front desk service' },
    ],
    imageId: 'plan-meeting-room',
    highlight: false,
    order: 4,
  },
  {
    slug: 'seminar-room',
    name: 'Seminar Room',
    summary: 'Space for seminars, workshops and training for up to 30.',
    audience: ['Seminars', 'Events', 'Workshops', 'Training sessions'],
    rates: [
      { id: 'up-to-14', label: 'Up to 14 people', amountBdt: 3000, unit: 'hour', capacity: 14 },
      // TODO(client): same price as "up to 14"; likely a typo on the reference site
      // (docs/09-roadmap.md #5). Shown as listed.
      { id: 'up-to-20', label: 'Up to 20 people', amountBdt: 3000, unit: 'hour', capacity: 20 },
      {
        id: 'up-to-30',
        label: 'Up to 30 people',
        amountBdt: 10000,
        unit: 'block',
        blockHours: 4,
        capacity: 30,
      },
    ],
    features: [INTERNET, PRINT, TEA_COFFEE, { title: 'Projector / TV' }],
    imageId: 'plan-seminar-room',
    highlight: false,
    order: 5,
  },
];
