// Remark plugin for the legal MDX (content/legal/*.mdx, wired up in next.config.ts). It gives
// every `##` heading an id and exports the page's table of contents:
//
//   export const toc = [{ id: 'service-agreement', title: '{legalName}’s Service Agreement' }]
//
// A heading may name the brand with <Brand field="…" />; the ToC title keeps it as a `{field}`
// token for the page to fill (lib/legal.ts → fillBrand), and the id leaves it out, so anchors
// stay put through a rebrand. Plain JS: the MDX loader imports it by path at build time.

/** @typedef {{ type: string; value?: string; name?: string; depth?: number; attributes?: { type: string; name?: string; value?: unknown }[]; children?: MdNode[]; data?: Record<string, unknown> }} MdNode */

/** The heading's text, with `<Brand field="x" />` as `{x}`. */
export function headingTitle(/** @type {MdNode} */ node) {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? '';
  if (node.type === 'mdxJsxTextElement' && node.name === 'Brand') {
    const field = node.attributes?.find((attr) => attr.name === 'field')?.value;
    return typeof field === 'string' ? `{${field}}` : '';
  }
  return (node.children ?? []).map(headingTitle).join('');
}

/** A URL fragment for a title: lowercase ASCII words joined by hyphens, brand tokens left out. */
export function slugify(/** @type {string} */ title) {
  return title
    .replace(/\{\w+\}(?:['’]s)?/g, '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** @param {unknown} value */
function toEstree(value) {
  if (Array.isArray(value)) return { type: 'ArrayExpression', elements: value.map(toEstree) };
  if (value !== null && typeof value === 'object') {
    return {
      type: 'ObjectExpression',
      properties: Object.entries(value).map(([key, item]) => ({
        type: 'Property',
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        key: { type: 'Identifier', name: key },
        value: toEstree(item),
      })),
    };
  }
  return { type: 'Literal', value };
}

/** An `export const <name> = <value>` node for MDX. */
function exportConst(/** @type {string} */ name, /** @type {unknown} */ value) {
  return {
    type: 'mdxjsEsm',
    value: '',
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ExportNamedDeclaration',
            specifiers: [],
            source: null,
            declaration: {
              type: 'VariableDeclaration',
              kind: 'const',
              declarations: [
                {
                  type: 'VariableDeclarator',
                  id: { type: 'Identifier', name },
                  init: toEstree(value),
                },
              ],
            },
          },
        ],
      },
    },
  };
}

export default function remarkLegal() {
  return (/** @type {MdNode} */ tree) => {
    /** @type {{ id: string; title: string }[]} */
    const toc = [];
    const seen = new Map();
    for (const node of tree.children ?? []) {
      if (node.type !== 'heading' || node.depth !== 2) continue;
      const title = headingTitle(node).trim();
      const base = slugify(title) || 'section';
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${String(count + 1)}`;
      node.data = { ...node.data, hProperties: { ...(node.data?.hProperties ?? {}), id } };
      toc.push({ id, title });
    }
    tree.children = [...(tree.children ?? []), exportConst('toc', toc)];
  };
}
