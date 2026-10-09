// Types for remark-legal.mjs, which stays plain JS so the MDX loader can import it by path.
export interface HeadingNode {
  type: string;
  value?: string;
  name?: string;
  attributes?: { type: string; name?: string; value?: unknown }[];
  children?: HeadingNode[];
}

export function headingTitle(node: HeadingNode): string;
export function slugify(title: string): string;
export default function remarkLegal(): (tree: unknown) => void;
