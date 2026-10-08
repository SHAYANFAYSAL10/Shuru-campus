import { type OpeningHours, type Plan } from '@campus/contracts';

import { hoursSummary } from '@/lib/hours-summary';
import { LEGAL_NAV } from '@/lib/navigation';

export interface FaqItem {
  id: string;
  question: string;
  /** One string per paragraph. */
  answer: string[];
  /** Where the full story is (a policy page). */
  link?: { href: string; label: string };
}

const legalHref = (label: string) => LEGAL_NAV.find((item) => item.label === label)?.href;

/** "We’re open Saturday to Thursday, 9:00–19:00, and closed on Friday." */
export function openingHoursAnswer(hours: OpeningHours): string {
  const rows = hoursSummary(hours);
  const open = rows.flatMap((row) => (row.time ? [`${row.daysLong}, ${row.time}`] : []));
  const closed = rows.flatMap((row) => (row.time ? [] : [row.daysLong]));
  if (open.length === 0) return 'We’re closed at the moment.';
  const closedText = closed.length > 0 ? `, and closed on ${closed.join(' and ')}` : '';
  return `We’re open ${open.join('; ')}${closedText}. All times are Dhaka time.`;
}

/**
 * The Spaces FAQ (05 → Spaces & Pricing): business address use, refunds, opening hours, guests
 * and the internet. Policy answers summarise the Terms and Refund policy in plain words
 * (docs/reference/legal-source.md) and link to the full text; hours and the internet come from
 * site settings and the plans, so they never disagree with the rest of the site.
 * TODO(client): have counsel check the policy summaries with the legal text (docs/09-roadmap.md #10).
 */
export function spacesFaq({
  hours,
  plans,
}: {
  hours: OpeningHours;
  plans: readonly Plan[];
}): FaqItem[] {
  const terms = legalHref('Terms');
  const refunds = legalHref('Refunds');
  const items: FaqItem[] = [
    {
      id: 'business-address',
      question: 'Can I use the address for my business?',
      answer: [
        'Yes. You can use our address as your business address, as long as you comply with the law. Within a month of signing your service agreement, share an official document certifying your registered address, a copy of your legal representative’s national ID card and your signed articles of association.',
        'Using the address in your company registration needs our approval first and is a paid service. It can’t be used as your address for service of process.',
      ],
      ...(terms ? { link: { href: terms, label: 'Read the terms' } } : {}),
    },
    {
      id: 'refunds',
      question: 'How do refunds work?',
      answer: [
        'We answer refund requests by email or phone within 48 hours (2 business days). Requests picked up on a Friday afternoon or a holiday can take a little longer.',
        'To cancel or void a card payment, ask by 6:00 PM on the day you paid, and at least 48 hours before your service starts. Have your name, the payment date and time, the authorization code, the card’s last four digits and the statement ID ready.',
      ],
      ...(refunds ? { link: { href: refunds, label: 'Read the refund policy' } } : {}),
    },
    {
      id: 'opening-hours',
      question: 'When are you open?',
      answer: [openingHoursAnswer(hours)],
    },
    {
      id: 'guests',
      question: 'Can I bring guests?',
      answer: [
        'Yes. Like your team, guests are expected to dress for business and keep the noise down so others can work, and nobody can stay overnight.',
      ],
    },
  ];

  // The speed is whatever the plans say it is (the seed's "Up to 40 Mbps internet").
  const withInternet = plans.filter((plan) => plan.features.some((f) => /internet/i.test(f.title)));
  const internet = withInternet[0]?.features.find((f) => /internet/i.test(f.title));
  if (internet) {
    const who =
      withInternet.length === plans.length
        ? 'every plan'
        : withInternet.map((plan) => plan.name).join(', ');
    items.push({
      id: 'internet',
      question: 'How fast is the internet?',
      answer: [
        `${internet.title}, included with ${who}. It’s a shared connection with no guaranteed service level, and it’s for lawful use only.`,
      ],
      ...(terms ? { link: { href: terms, label: 'Read the internet policy in our terms' } } : {}),
    });
  }
  return items;
}
