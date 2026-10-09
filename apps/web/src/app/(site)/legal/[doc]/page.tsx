import * as privacy from '@content/legal/privacy.mdx';
import * as refund from '@content/legal/refund.mdx';
import * as terms from '@content/legal/terms.mdx';
import { notFound } from 'next/navigation';

import { LegalContents } from '@/components/legal/legal-contents';
import { LegalDocNav } from '@/components/legal/legal-doc-nav';
import { LegalToc } from '@/components/legal/legal-toc';
import { getBrand } from '@/lib/api';
import { cn } from '@/lib/cn';
import {
  fillBrand,
  findLegalDoc,
  formatUpdated,
  LEGAL_DOCS,
  legalComponents,
  legalHref,
  type LegalSlug,
} from '@/lib/legal';
import { pageMetadata } from '@/lib/metadata';
import { SITE_URL } from '@/lib/site-url';

import type { Metadata } from 'next';

const CONTENT = { privacy, terms, refund } satisfies Record<LegalSlug, unknown>;

/** Only the three policies exist; anything else under /legal is a 404. */
export const dynamicParams = false;

export function generateStaticParams(): { doc: string }[] {
  return LEGAL_DOCS.map(({ slug }) => ({ doc: slug }));
}

async function loadDoc(params: Promise<{ doc: string }>) {
  const doc = findLegalDoc((await params).doc);
  if (!doc) notFound();
  return doc;
}

export async function generateMetadata({ params }: PageProps<'/legal/[doc]'>): Promise<Metadata> {
  const [brand, doc] = await Promise.all([getBrand(), loadDoc(params)]);
  return pageMetadata(brand, {
    title: doc.title,
    description: doc.description,
    path: legalHref(doc.slug),
  });
}

/**
 * A legal page (docs/05-pages-and-interactions.md → Legal): the policy's MDX in a readable prose
 * column, "Last updated", the other policies a tap away, and its sections as a sticky,
 * scroll-spied table of contents from `lg` (a disclosure above the text below it). A page with
 * fewer than two sections has no contents. `data-legal-doc` switches on the print stylesheet
 * (styles/legal.css).
 */
export default async function LegalPage({ params }: PageProps<'/legal/[doc]'>) {
  const [brand, doc] = await Promise.all([getBrand(), loadDoc(params)]);
  const { default: Content, toc } = CONTENT[doc.slug];
  const entries = toc.map((entry) => ({ id: entry.id, title: fillBrand(entry.title, brand) }));
  const hasToc = entries.length > 1;

  return (
    <div
      data-legal-doc=""
      className="mx-auto max-w-content pt-12 px-page-safe pb-section sm:pt-16 lg:pt-24"
    >
      <header className="max-w-3xl">
        <p className="type-eyebrow text-fg-subtle">Legal</p>
        <h1 className="mt-4 type-h1 text-balance text-fg">{doc.title}</h1>
        <p className="mt-6 text-small text-fg-muted">
          Last updated <time dateTime={doc.updated}>{formatUpdated(doc.updated)}</time>
        </p>
        <LegalDocNav current={doc.slug} className="mt-8" />
      </header>

      <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-gutter">
        {hasToc ? (
          <>
            <LegalContents entries={entries} className="lg:hidden" />
            {/* Sticks a little below the header (or the top, while the header is hidden). */}
            <LegalToc
              entries={entries}
              className="hidden self-start lg:sticky lg:top-[calc(var(--sticky-top)+--spacing(8))] lg:col-span-3 lg:block"
            />
          </>
        ) : null}
        <article className={cn('max-w-prose min-w-0 lg:col-span-8', hasToc && 'lg:col-start-5')}>
          <Content components={legalComponents(brand, SITE_URL)} />
        </article>
      </div>
    </div>
  );
}
