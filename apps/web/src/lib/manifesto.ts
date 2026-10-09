import { type Brand } from '@campus/contracts';

/**
 * What each pillar means here, finishing a sentence the pillar starts ("Empower your
 * business…"). Drawn from the About copy (docs/02-content.md → About copy). Keyed by the
 * pillar in lower case, so a renamed pillar simply has no statement until one is written.
 */
const STATEMENTS: Readonly<Record<string, string>> = {
  empower:
    'your business with a head-start: a shared workspace and office services, without setting them up alone.',
  enhance: 'your work in a professional, tranquil and buoyant atmosphere.',
  enrich: 'your days alongside businesses, entrepreneurs and independent professionals.',
};

export interface ManifestoStatement {
  /** The pillar as the brand writes it ("Empower"). */
  pillar: string;
  /** The rest of the sentence. */
  rest: string;
}

/** The rest of a pillar's statement, or `undefined` when none is written for it. */
export function pillarStatement(pillar: string): string | undefined {
  return STATEMENTS[pillar.trim().toLowerCase()];
}

/**
 * The Home manifesto (docs/05-pages-and-interactions.md → Home #2): one statement per brand
 * pillar, in the brand's order. Pillars without a statement are left out.
 */
export function manifestoStatements(pillars: Brand['pillars']): ManifestoStatement[] {
  return pillars.flatMap((pillar) => {
    const rest = pillarStatement(pillar);
    return rest ? [{ pillar: pillar.trim(), rest }] : [];
  });
}
