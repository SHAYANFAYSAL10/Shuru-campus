import { type Brand } from '@campus/contracts';

import { sentence } from '@/lib/metadata';

/**
 * The legal pages (docs/05-pages-and-interactions.md → Legal), in footer order. Their text is
 * `content/legal/<slug>.mdx`, kept verbatim from docs/reference/legal-source.md.
 * TODO(client): counsel review and the real "last updated" dates (docs/09-roadmap.md #10). Until
 * then `updated` is the day the reference text was captured.
 */
export const LEGAL_DOCS = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    navLabel: 'Privacy',
    description:
      'What personal information we collect when you use this website, and how we use it.',
    updated: '2026-10-07',
  },
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    navLabel: 'Terms',
    description:
      'The rules that apply between us and our clients: accommodation, use, the service agreement, fees, liability and IT policy.',
    updated: '2026-10-07',
  },
  {
    slug: 'refund',
    title: 'Refund Policy',
    navLabel: 'Refunds',
    description: 'How to cancel a card payment or ask for a refund, and how long it takes.',
    updated: '2026-10-07',
  },
] as const;

export type LegalDoc = (typeof LEGAL_DOCS)[number];
export type LegalSlug = LegalDoc['slug'];

export function legalHref(slug: LegalSlug): string {
  return `/legal/${slug}`;
}

/** The legal page for a route param, or `undefined` (a 404). */
export function findLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.slug === slug);
}

/** "7 October 2026" for an ISO date, read as a calendar date (no time zone shift). */
export function formatUpdated(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** The brand fields legal copy may name: `<Brand field="legalName" />` in MDX. */
export type BrandField = keyof Pick<Brand, 'name' | 'shortName' | 'legalName'>;

/**
 * One entry of a legal page's table of contents, exported by each MDX file as `toc`
 * (`lib/mdx/remark-legal.mjs`). A heading that names the brand carries `{legalName}`-style tokens
 * in `title`; `fillBrand()` swaps in the configured names.
 */
export interface TocEntry {
  id: string;
  title: string;
}

/** `title` with its `{name}`, `{shortName}` and `{legalName}` tokens filled from `brand`. */
export function fillBrand(title: string, brand: Pick<Brand, BrandField>): string {
  return title.replace(/\{(name|shortName|legalName)\}/g, (_, field: BrandField) => brand[field]);
}

export interface BrandProps {
  field: BrandField;
  /** Closes a sentence: adds a full stop unless the name ends in one ("Ltd."). */
  endsSentence?: boolean;
}

/**
 * The components legal MDX uses beyond prose: `<Brand field="legalName" />` for the company's
 * names (never written into the text, docs/03-architecture.md → Brand configuration) and
 * `<SiteDomain />` for this website's address.
 */
export function legalComponents(brand: Pick<Brand, BrandField>, site: URL) {
  return {
    Brand: ({ field, endsSentence = false }: BrandProps) =>
      endsSentence ? sentence(brand[field]) : brand[field],
    SiteDomain: () => site.host,
  };
}

/**
 * Scroll-spy: the section being read, as an index into the headings, given each heading's top
 * edge (viewport px, in document order) and the reading line it has to pass. Before the first
 * heading it's -1; at the end of the page it's the last one, even if that heading never
 * reaches the line (short final sections).
 */
export function activeSection(tops: readonly number[], line: number, atEnd: boolean): number {
  if (tops.length === 0) return -1;
  if (atEnd) return tops.length - 1;
  let active = -1;
  tops.forEach((top, index) => {
    if (top <= line) active = index;
  });
  return active;
}
