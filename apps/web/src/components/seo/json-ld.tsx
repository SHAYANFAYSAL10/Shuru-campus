import { jsonLdHtml } from '@/lib/local-business';

/**
 * Structured data for search engines. A data block, not a script: the browser never runs it,
 * so the CSP doesn't need to allow it.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Escaped by jsonLdHtml(), so a value can't close the element.
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }}
    />
  );
}
