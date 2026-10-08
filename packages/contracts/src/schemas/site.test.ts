import { describe, expect, it } from 'vitest';

import { Brand } from './brand';
import { BdPhone, Href, HttpsUrl, TimeOfDay } from './primitives';
import { Announcement, DayHours, OpeningHours, SiteSettings } from './site';

const brand = {
  name: 'Acme Works',
  shortName: 'Acme',
  legalName: 'Acme Works Ltd.',
  tagline: 'Shared workspace',
  subTagline: 'Work, better',
  pillars: ['Focus'],
  logo: { kind: 'wordmark' },
};

const week = [0, 1, 2, 3, 4, 5, 6].map((day) =>
  day === 5 ? { day, open: null, close: null } : { day, open: '09:00', close: '19:00' },
);

const site = {
  brand,
  contact: {
    addressLines: ['Level 8, Example Tower', 'Dhaka-1212'],
    phones: ['+88 01700-766084'],
    email: 'hello@example.com',
    mapUrl: 'https://maps.google.com/?q=example',
  },
  hours: { timezone: 'Asia/Dhaka', weekly: week },
  socials: [{ platform: 'facebook', url: 'https://facebook.com/example' }],
  memberPortal: { loginUrl: 'https://example.com/login', signupUrl: 'https://example.com/signup' },
  announcement: { enabled: false, text: '' },
  features: { inquiryForm: true, gallery: true, maintenanceMode: false },
};

describe('Brand', () => {
  it('accepts a wordmark brand without a name meaning', () => {
    expect(Brand.safeParse(brand).success).toBe(true);
  });

  it.each([
    ['name', 60],
    ['shortName', 24],
    ['legalName', 120],
  ])('limits %s to %i characters', (field, max) => {
    expect(Brand.safeParse({ ...brand, [field]: 'x'.repeat(max) }).success).toBe(true);
    expect(Brand.safeParse({ ...brand, [field]: 'x'.repeat(max + 1) }).success).toBe(false);
    expect(Brand.safeParse({ ...brand, [field]: '   ' }).success).toBe(false);
  });

  it('allows one to four pillars', () => {
    expect(Brand.safeParse({ ...brand, pillars: [] }).success).toBe(false);
    expect(Brand.safeParse({ ...brand, pillars: ['a', 'b', 'c', 'd'] }).success).toBe(true);
    expect(Brand.safeParse({ ...brand, pillars: ['a', 'b', 'c', 'd', 'e'] }).success).toBe(false);
  });

  it('requires alt text for an image logo', () => {
    const logo = { kind: 'image', src: '/brand/logo.svg' };
    expect(Brand.safeParse({ ...brand, logo }).success).toBe(false);
    expect(Brand.safeParse({ ...brand, logo: { ...logo, alt: 'Acme Works' } }).success).toBe(true);
  });

  it('rejects protocol-relative and http logo sources', () => {
    for (const src of ['//evil.example/logo.svg', 'http://example.com/logo.svg']) {
      expect(Brand.safeParse({ ...brand, logo: { kind: 'image', src, alt: 'x' } }).success).toBe(
        false,
      );
    }
  });
});

describe('primitives', () => {
  it.each(['+88 09666-731731', '+88 01700-766084', '01700766084', '8801700766084', '02-9881234'])(
    'BdPhone accepts %s',
    (phone) => {
      expect(BdPhone.safeParse(phone).success).toBe(true);
    },
  );

  it.each(['+1 415 555 0100', '1700766084', '+88 017007660841', 'call us', ''])(
    'BdPhone rejects %s',
    (phone) => {
      expect(BdPhone.safeParse(phone).success).toBe(false);
    },
  );

  it.each([
    ['09:00', true],
    ['23:59', true],
    ['24:00', false],
    ['9:00', false],
    ['09:60', false],
  ])('TimeOfDay %s → %s', (time, ok) => {
    expect(TimeOfDay.safeParse(time).success).toBe(ok);
  });

  it('HttpsUrl only accepts https', () => {
    expect(HttpsUrl.safeParse('https://example.com/x').success).toBe(true);
    expect(HttpsUrl.safeParse('http://example.com/x').success).toBe(false);
    expect(HttpsUrl.safeParse('javascript:alert(1)').success).toBe(false);
  });

  it('Href accepts site paths and https links, never protocol-relative URLs', () => {
    expect(Href.safeParse('/spaces?period=monthly').success).toBe(true);
    expect(Href.safeParse('https://example.com').success).toBe(true);
    expect(Href.safeParse('//evil.example').success).toBe(false);
    expect(Href.safeParse('spaces').success).toBe(false);
  });
});

describe('DayHours', () => {
  it('accepts an open day and a closed day', () => {
    expect(DayHours.safeParse({ day: 1, open: '09:00', close: '19:00' }).success).toBe(true);
    expect(DayHours.safeParse({ day: 5, open: null, close: null }).success).toBe(true);
  });

  it('requires close to be after open', () => {
    const result = DayHours.safeParse({ day: 1, open: '19:00', close: '09:00' });
    expect(result.error?.issues.map((i) => i.path.join('.'))).toEqual(['close']);
    expect(DayHours.safeParse({ day: 1, open: '09:00', close: '09:00' }).success).toBe(false);
  });

  it('rejects a half-set day', () => {
    expect(DayHours.safeParse({ day: 1, open: '09:00', close: null }).success).toBe(false);
    expect(DayHours.safeParse({ day: 1, open: null, close: '19:00' }).success).toBe(false);
  });

  it('rejects weekday numbers outside 0–6', () => {
    expect(DayHours.safeParse({ day: 7, open: null, close: null }).success).toBe(false);
  });
});

describe('OpeningHours', () => {
  it('needs each weekday exactly once', () => {
    expect(OpeningHours.safeParse({ timezone: 'Asia/Dhaka', weekly: week }).success).toBe(true);
    expect(OpeningHours.safeParse({ timezone: 'Asia/Dhaka', weekly: week.slice(1) }).success).toBe(
      false,
    );
    const duplicated = [...week.slice(1), week[1]];
    expect(OpeningHours.safeParse({ timezone: 'Asia/Dhaka', weekly: duplicated }).success).toBe(
      false,
    );
  });

  it('only accepts the Dhaka timezone', () => {
    expect(OpeningHours.safeParse({ timezone: 'UTC', weekly: week }).success).toBe(false);
  });
});

describe('Announcement', () => {
  it('needs text when enabled', () => {
    expect(Announcement.safeParse({ enabled: true, text: '  ' }).success).toBe(false);
    expect(Announcement.safeParse({ enabled: false, text: '' }).success).toBe(true);
  });

  it.each([
    [120, true],
    [121, false],
  ])('text of %i chars → valid: %s', (len, ok) => {
    expect(Announcement.safeParse({ enabled: true, text: 'a'.repeat(len) }).success).toBe(ok);
  });
});

describe('SiteSettings', () => {
  it('accepts a complete settings object', () => {
    expect(SiteSettings.safeParse(site).success).toBe(true);
  });

  it('reports nested field paths', () => {
    const result = SiteSettings.safeParse({
      ...site,
      contact: { ...site.contact, phones: ['+1 415 555 0100'], email: 'nope' },
    });
    expect(result.error?.issues.map((i) => i.path.join('.')).sort()).toEqual([
      'contact.email',
      'contact.phones.0',
    ]);
  });

  it('rejects http social and portal links', () => {
    expect(
      SiteSettings.safeParse({
        ...site,
        socials: [{ platform: 'x', url: 'http://x.com/example' }],
      }).success,
    ).toBe(false);
  });
});
