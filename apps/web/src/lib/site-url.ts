/**
 * The public site's canonical URL (`NEXT_PUBLIC_SITE_URL`, docs/03-architecture.md → Environment
 * variables): the base for metadata, Open Graph, the sitemap and robots.txt.
 */
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');

/** Absolute URL of a site path (`/spaces` → `https://…/spaces`). */
export function absoluteUrl(path: string, base: URL = SITE_URL): string {
  return new URL(path, base).toString();
}
