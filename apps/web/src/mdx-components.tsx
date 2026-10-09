import NextLink from 'next/link';
import { type ComponentProps } from 'react';

import type { MDXComponents } from 'mdx/types';

/**
 * Prose for MDX (the legal pages): a 65ch measure (B1), Fraunces for section headings only (B2),
 * sans sub-headings, and inline links as A6 styles them. `@next/mdx` picks this file up by name;
 * pages add their own components (`Brand`) through the content's `components` prop.
 */
const components: MDXComponents = {
  h2: ({ children, ...props }: ComponentProps<'h2'>) => (
    <h2 className="mt-14 type-h3 text-balance text-fg first:mt-0" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentProps<'h3'>) => (
    <h3 className="mt-10 font-semibold text-balance text-fg" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: ComponentProps<'h4'>) => (
    <h4 className="mt-6 font-medium text-fg" {...props}>
      {children}
    </h4>
  ),
  p: (props: ComponentProps<'p'>) => <p className="mt-4 text-pretty text-fg-muted" {...props} />,
  ul: (props: ComponentProps<'ul'>) => (
    <ul
      className="mt-4 flex list-disc flex-col gap-2 pl-6 text-fg-muted marker:text-fg-subtle"
      {...props}
    />
  ),
  ol: (props: ComponentProps<'ol'>) => (
    <ol
      className="mt-4 flex list-decimal flex-col gap-2 pl-6 text-fg-muted marker:text-fg-subtle"
      {...props}
    />
  ),
  strong: (props: ComponentProps<'strong'>) => (
    <strong className="font-semibold text-fg" {...props} />
  ),
  a: ({ href = '', ...props }: ComponentProps<'a'>) => (
    <NextLink
      href={href}
      className="rounded-sm text-accent-text underline decoration-1 underline-offset-3 hover:decoration-2"
      {...props}
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
