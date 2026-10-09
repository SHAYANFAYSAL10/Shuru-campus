import { type OpeningHours, type SiteSettings } from '@campus/contracts';

import { siteDescription } from '@/lib/metadata';
import { absoluteUrl, SITE_URL } from '@/lib/site-url';

const DAY_NAME = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

/** Open days grouped by identical times, from Saturday (closed days are simply left out). */
export function openingHoursSpecification(hours: OpeningHours): OpeningHoursSpecification[] {
  const groups = new Map<string, OpeningHoursSpecification>();
  for (const offset of [6, 0, 1, 2, 3, 4, 5]) {
    const day = hours.weekly.find((d) => d.day === offset);
    if (!day?.open || !day.close) continue;
    const key = `${day.open}-${day.close}`;
    const group = groups.get(key) ?? {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [],
      opens: day.open,
      closes: day.close,
    };
    group.dayOfWeek.push(DAY_NAME[day.day] ?? '');
    groups.set(key, group);
  }
  return [...groups.values()];
}

/**
 * schema.org `LocalBusiness` for Home and Contact (CLAUDE.md §3), built only from site settings,
 * so it follows the brand config and never states a fact the site doesn't.
 */
export function localBusinessJsonLd(site: SiteSettings, base: URL = SITE_URL) {
  const { brand, contact, hours, socials } = site;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': absoluteUrl('/#business', base),
    name: brand.name,
    legalName: brand.legalName,
    description: siteDescription(brand),
    url: absoluteUrl('/', base),
    image: absoluteUrl('/opengraph-image', base),
    telephone: contact.phones[0],
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.addressLines.join(', '),
      // The contract only accepts Bangladeshi phone numbers, and hours are in Asia/Dhaka.
      addressCountry: 'BD',
    },
    hasMap: contact.mapUrl,
    openingHoursSpecification: openingHoursSpecification(hours),
    ...(socials.length > 0 ? { sameAs: socials.map((s) => s.url) } : {}),
  };
}

/**
 * Serializes structured data for a `<script type="application/ld+json">`. `<` is escaped so a
 * value containing `</script>` can't end the element early.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
