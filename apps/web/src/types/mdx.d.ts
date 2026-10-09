/// <reference types="mdx" />

// The legal MDX also exports its table of contents (src/lib/mdx/remark-legal.mjs).
declare module '*.mdx' {
  import { type TocEntry } from '@/lib/legal';

  export const toc: TocEntry[];
}
