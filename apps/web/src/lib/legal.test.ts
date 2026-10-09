import { describe, expect, it } from 'vitest';

import { defaultBrand } from '@campus/contracts';

import {
  activeSection,
  fillBrand,
  findLegalDoc,
  formatUpdated,
  LEGAL_DOCS,
  legalComponents,
  legalHref,
} from '@/lib/legal';
import { LEGAL_NAV } from '@/lib/navigation';

const ACME = { name: 'Acme Works', shortName: 'Acme', legalName: 'Acme Works Ltd.' };

describe('legal pages', () => {
  it('are privacy, terms and refunds, linked from the footer in that order', () => {
    expect(LEGAL_DOCS.map((doc) => doc.slug)).toEqual(['privacy', 'terms', 'refund']);
    expect(LEGAL_NAV).toEqual([
      { href: '/legal/privacy', label: 'Privacy' },
      { href: '/legal/terms', label: 'Terms' },
      { href: '/legal/refund', label: 'Refunds' },
    ]);
  });

  it('finds a page by its slug, and nothing else', () => {
    expect(findLegalDoc('terms')?.title).toBe('Terms & Conditions');
    expect(findLegalDoc('cookies')).toBeUndefined();
    expect(findLegalDoc('')).toBeUndefined();
    expect(legalHref('refund')).toBe('/legal/refund');
  });

  it('never names the brand in its titles or descriptions', () => {
    for (const doc of LEGAL_DOCS) {
      expect(`${doc.title} ${doc.description}`).not.toContain(defaultBrand.name);
    }
  });
});

describe('formatUpdated', () => {
  it('reads an ISO date as a calendar date, whatever the time zone', () => {
    // CI runs in America/Los_Angeles; a midnight-UTC Date there is still the 6th.
    expect(formatUpdated('2026-10-07')).toBe('7 October 2026');
  });
});

describe('fillBrand', () => {
  it('fills brand tokens in a contents title', () => {
    expect(fillBrand('{legalName}’s Service Agreement', ACME)).toBe(
      'Acme Works Ltd.’s Service Agreement',
    );
    expect(fillBrand('{name} and {shortName}', ACME)).toBe('Acme Works and Acme');
  });

  it('leaves other braces alone', () => {
    expect(fillBrand('Fees {tagline}', ACME)).toBe('Fees {tagline}');
  });
});

describe('legalComponents', () => {
  const { Brand, SiteDomain } = legalComponents(ACME, new URL('https://acme.example/legal'));

  it('names the brand from config', () => {
    expect(Brand({ field: 'legalName' })).toBe('Acme Works Ltd.');
    expect(Brand({ field: 'shortName' })).toBe('Acme');
  });

  it('ends a sentence once, whether or not the name ends in a full stop', () => {
    expect(Brand({ field: 'legalName', endsSentence: true })).toBe('Acme Works Ltd.');
    expect(Brand({ field: 'name', endsSentence: true })).toBe('Acme Works.');
  });

  it('gives the site’s own address', () => {
    expect(SiteDomain()).toBe('acme.example');
  });
});

describe('activeSection', () => {
  const LINE = 300;

  it('is nothing before the first heading reaches the reading line', () => {
    expect(activeSection([400, 900, 1600], LINE, false)).toBe(-1);
    expect(activeSection([], LINE, false)).toBe(-1);
    expect(activeSection([], LINE, true)).toBe(-1);
  });

  it('is the last heading above the line', () => {
    expect(activeSection([300, 900, 1600], LINE, false)).toBe(0);
    expect(activeSection([-800, 120, 700], LINE, false)).toBe(1);
    expect(activeSection([-1600, -900, -20], LINE, false)).toBe(2);
  });

  it('is the last section at the end of the page, even if its heading never got there', () => {
    expect(activeSection([-900, 100, 500], LINE, true)).toBe(2);
  });
});
