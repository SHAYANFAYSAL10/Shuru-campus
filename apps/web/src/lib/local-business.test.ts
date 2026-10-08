import { describe, expect, it } from 'vitest';

import { siteSeed } from '@campus/contracts';

import { jsonLdHtml, localBusinessJsonLd, openingHoursSpecification } from '@/lib/local-business';

const BASE = new URL('https://example.test');

describe('openingHoursSpecification', () => {
  it('groups the seed week into one Saturday–Thursday spec and leaves Friday out', () => {
    expect(openingHoursSpecification(siteSeed.hours)).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '09:00',
        closes: '19:00',
      },
    ]);
  });

  it('splits days with different times', () => {
    const weekly = siteSeed.hours.weekly.map((d) =>
      d.day === 4 ? { ...d, open: '09:00', close: '13:00' } : d,
    );
    const specs = openingHoursSpecification({ ...siteSeed.hours, weekly });
    expect(specs).toHaveLength(2);
    expect(specs[1]).toMatchObject({ dayOfWeek: ['Thursday'], closes: '13:00' });
  });
});

describe('localBusinessJsonLd', () => {
  it('describes the business from the site settings', () => {
    const data = localBusinessJsonLd(siteSeed, BASE);
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: siteSeed.brand.name,
      legalName: siteSeed.brand.legalName,
      url: 'https://example.test/',
      telephone: siteSeed.contact.phones[0],
      email: siteSeed.contact.email,
      hasMap: siteSeed.contact.mapUrl,
      address: { streetAddress: siteSeed.contact.addressLines.join(', '), addressCountry: 'BD' },
      sameAs: siteSeed.socials.map((s) => s.url),
    });
  });

  it('follows a renamed brand and leaves sameAs out without socials', () => {
    const site = {
      ...siteSeed,
      brand: { ...siteSeed.brand, name: 'Acme Works', legalName: 'Acme Works Ltd.' },
      socials: [],
    };
    const data = localBusinessJsonLd(site, BASE);
    expect(data.name).toBe('Acme Works');
    expect(data).not.toHaveProperty('sameAs');
    expect(data.legalName).toBe('Acme Works Ltd.');
  });
});

describe('jsonLdHtml', () => {
  it('escapes "<" so a value cannot close the script element', () => {
    const html = jsonLdHtml({ name: '</script><script>alert(1)</script>' });
    expect(html).not.toContain('<');
    expect(JSON.parse(html)).toEqual({ name: '</script><script>alert(1)</script>' });
  });
});
