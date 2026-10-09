// @vitest-environment node
// Compiles real MDX and reads the content files from disk.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { evaluate } from '@mdx-js/mdx';
import { createElement, type ComponentType } from 'react';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { defaultBrand } from '@campus/contracts';

import { LEGAL_DOCS, legalComponents, type TocEntry } from '@/lib/legal';
import remarkLegal, { headingTitle, slugify } from '@/lib/mdx/remark-legal.mjs';

const ACME = { name: 'Acme Works', shortName: 'Acme', legalName: 'Acme Works Ltd.' };
const SITE = new URL('https://acme.example');
const CONTENT_DIR = fileURLToPath(new URL('../../../content/legal/', import.meta.url));

/** Compiles MDX with the plugin, as `@next/mdx` does, and renders it with the Acme brand. */
async function compile(source: string) {
  const mod = await evaluate(source, { ...runtime, remarkPlugins: [remarkLegal] });
  const Content = mod.default as ComponentType<{ components: object }>;
  const html = renderToStaticMarkup(
    createElement(Content, { components: legalComponents(ACME, SITE) }),
  );
  return { html, toc: mod.toc as TocEntry[] };
}

describe('slugify', () => {
  it('makes lowercase ASCII fragments', () => {
    expect(slugify('Cancelling/Voiding a Payment')).toBe('cancelling-voiding-a-payment');
    expect(slugify('  IT Policy ')).toBe('it-policy');
    expect(slugify('Café & Événements')).toBe('cafe-evenements');
  });

  it('leaves brand tokens (and their possessive) out, so anchors survive a rebrand', () => {
    expect(slugify('{legalName}’s Service Agreement')).toBe('service-agreement');
    expect(slugify("{name}'s Rules")).toBe('rules');
  });
});

describe('headingTitle', () => {
  it('turns <Brand field> into a token and keeps the text around it', () => {
    expect(
      headingTitle({
        type: 'heading',
        children: [
          {
            type: 'mdxJsxTextElement',
            name: 'Brand',
            attributes: [{ type: 'mdxJsxAttribute', name: 'field', value: 'legalName' }],
          },
          { type: 'text', value: '’s ' },
          { type: 'emphasis', children: [{ type: 'inlineCode', value: 'Service' }] },
        ],
      }),
    ).toBe('{legalName}’s Service');
  });

  it('drops other elements’ markup, and a Brand without a field', () => {
    expect(
      headingTitle({
        type: 'heading',
        children: [
          { type: 'mdxJsxTextElement', name: 'Brand', attributes: [] },
          { type: 'mdxJsxTextElement', name: 'Other', children: [{ type: 'text', value: 'Fees' }] },
        ],
      }),
    ).toBe('Fees');
  });
});

describe('remarkLegal', () => {
  it('gives each section heading an id and exports the contents', async () => {
    const { html, toc } = await compile(
      '## Use\n\nText.\n\n### Signage\n\n## <Brand field="legalName" />’s Service Agreement\n\n## Use\n',
    );
    expect(toc).toEqual([
      { id: 'use', title: 'Use' },
      { id: 'service-agreement', title: '{legalName}’s Service Agreement' },
      { id: 'use-2', title: 'Use' },
    ]);
    expect(html).toContain('<h2 id="use">Use</h2>');
    expect(html).toContain('<h2 id="service-agreement">Acme Works Ltd.’s Service Agreement</h2>');
    expect(html).toContain('<h2 id="use-2">');
    // Only sections (h2) are in the contents.
    expect(html).toContain('<h3>Signage</h3>');
  });

  it('exports empty contents for a page without sections', async () => {
    expect((await compile('Just a paragraph.')).toc).toEqual([]);
  });
});

describe.each(LEGAL_DOCS)('content/legal/$slug.mdx', ({ slug }) => {
  const source = readFileSync(`${CONTENT_DIR}${slug}.mdx`, 'utf8');

  it('renders with any brand and never names the default one', async () => {
    const { html } = await compile(source);
    expect(html.toLowerCase()).not.toContain(defaultBrand.shortName.toLowerCase());
    expect(html).not.toMatch(/\{(name|shortName|legalName)\}|<Brand|SiteDomain/);
    // A legal name ending in "Ltd." never doubles a sentence's full stop.
    expect(html).not.toContain('Ltd..');
  });

  it('lists unique, brand-neutral section ids', async () => {
    const { toc } = await compile(source);
    const ids = toc.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

describe('the policies’ structure', () => {
  it('splits the terms into their six parts', async () => {
    const source = readFileSync(`${CONTENT_DIR}terms.mdx`, 'utf8');
    expect((await compile(source)).toc.map((entry) => entry.id)).toEqual([
      'accommodation',
      'use',
      'service-agreement',
      'fees',
      'liability',
      'it-policy',
    ]);
  });

  it('gives the refund policy its two procedures', async () => {
    const source = readFileSync(`${CONTENT_DIR}refund.mdx`, 'utf8');
    const { toc, html } = await compile(source);
    expect(toc.map((entry) => entry.title)).toEqual([
      'Cancelling/Voiding a Payment',
      'Refund of Payment',
    ]);
    expect(html.match(/<li>/g)).toHaveLength(10);
  });
});
