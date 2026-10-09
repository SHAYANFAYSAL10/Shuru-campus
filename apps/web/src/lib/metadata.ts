import { type Brand } from '@campus/contracts';

import { palette } from '@/lib/palette';
import { SITE_URL } from '@/lib/site-url';

import type { Metadata, Viewport } from 'next';

/** The site's default description, from the brand's taglines (docs/02-content.md → Brand). */
export function siteDescription(brand: Pick<Brand, 'tagline' | 'subTagline'>): string {
  return `${sentence(brand.tagline)} ${sentence(brand.subTagline)}`;
}

/** Ends `text` with a full stop unless it already ends a sentence. */
export function sentence(text: string): string {
  const trimmed = text.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/**
 * Default metadata for every page (docs/03-architecture.md → Brand configuration). Pages set
 * `title` (filled into the `%s · {name}` template) and `description`. A page that sets
 * `openGraph` replaces this object whole, so public pages use `pageMetadata()`, which spreads it in.
 * The OG image comes from `app/opengraph-image.tsx`.
 */
export function siteMetadata(brand: Brand, base: URL = SITE_URL): Metadata {
  const description = siteDescription(brand);
  const title = `${brand.name} · ${brand.tagline}`;
  return {
    metadataBase: base,
    applicationName: brand.name,
    title: { default: title, template: `%s · ${brand.name}` },
    description,
    openGraph: {
      type: 'website',
      siteName: brand.name,
      locale: 'en_BD',
      title,
      description,
      url: '/',
    },
    twitter: { card: 'summary_large_image', title, description },
    // Phones and addresses are real links already; stop iOS restyling them.
    formatDetection: { telephone: false, address: false, email: false },
  };
}

export interface PageMetadataInput {
  /** Filled into the `%s · {name}` template. Omit on Home, which keeps the site title. */
  title?: string;
  description: string;
  /** The page's path, for the canonical URL and `og:url`. */
  path: string;
}

/**
 * A public page's metadata: its title and description, a canonical URL, and Open Graph and
 * Twitter cards that keep the site defaults (siteName, image, card type) but describe this page.
 */
export function pageMetadata(
  brand: Brand,
  { title, description, path }: PageMetadataInput,
): Metadata {
  const site = siteMetadata(brand);
  const shareTitle = title ? `${title} · ${brand.name}` : `${brand.name} · ${brand.tagline}`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { ...site.openGraph, title: shareTitle, description, url: path },
    twitter: { ...site.twitter, title: shareTitle, description },
  };
}

/** Browser chrome follows the page background in each OS scheme. */
export const siteViewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: palette.paper },
    { media: '(prefers-color-scheme: dark)', color: palette.night },
  ],
};
