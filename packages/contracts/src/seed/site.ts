import { defaultBrand } from './brand';
import { type SiteSettings } from '../schemas/site';

/** Source: docs/02-content.md → Contact & location. */
export const siteSeed: SiteSettings = {
  brand: defaultBrand,
  contact: {
    addressLines: [
      'Wakil Tower (8th Floor)',
      'Ta-131 Gulshan – Badda Link Road',
      'Gulshan, Dhaka-1212',
    ],
    phones: ['+88 09666-731731', '+88 01700-766084'],
    // TODO(client): confirm where inquiries should go once email is enabled (docs/09-roadmap.md #7).
    email: 'info@shurucampus.com',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=Wakil+Tower%2C+Gulshan+-+Badda+Link+Road%2C+Dhaka+1212',
  },
  hours: {
    timezone: 'Asia/Dhaka',
    // 0 = Sunday … 6 = Saturday. Saturday–Thursday 09:00–19:00, Friday closed.
    weekly: [
      { day: 0, open: '09:00', close: '19:00' },
      { day: 1, open: '09:00', close: '19:00' },
      { day: 2, open: '09:00', close: '19:00' },
      { day: 3, open: '09:00', close: '19:00' },
      { day: 4, open: '09:00', close: '19:00' },
      { day: 5, open: null, close: null },
      { day: 6, open: '09:00', close: '19:00' },
    ],
  },
  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/ShuruCampus/' },
    { platform: 'instagram', url: 'https://www.instagram.com/shurucampus/' },
    { platform: 'x', url: 'https://twitter.com/ShuruCampus' },
  ],
  // TODO(client): confirm members still use OfficeRnD (docs/09-roadmap.md #9).
  memberPortal: {
    loginUrl: 'https://shuru-campus.officernd.com/login',
    signupUrl: 'https://shuru-campus.officernd.com/signup',
  },
  announcement: { enabled: false, text: '' },
  features: { inquiryForm: true, gallery: true, maintenanceMode: false },
};
