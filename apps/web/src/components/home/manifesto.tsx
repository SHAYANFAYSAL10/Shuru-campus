import { type Brand } from '@campus/contracts';

import { ScrollText } from '@/components/motion/scroll-text';
import { manifestoStatements } from '@/lib/manifesto';

/**
 * Home #2 (docs/05-pages-and-interactions.md): the brand's pillars as the section title, then
 * one large statement per pillar, each opening with the pillar itself. Each statement's words
 * brighten in reading order as it scrolls up the page (`<ScrollText>`: scroll-linked CSS,
 * so it needs no JS; full strength without support or under reduced motion). Renders nothing
 * when no pillar has a statement (a renamed brand).
 */
export function Manifesto({ pillars }: { pillars: Brand['pillars'] }) {
  const statements = manifestoStatements(pillars);
  if (statements.length === 0) return null;
  const names = statements.map((s) => s.pillar);

  return (
    <section aria-labelledby="manifesto-title" className="bg-bg-alt">
      <div className="mx-auto grid max-w-content gap-10 py-section px-page-safe lg:grid-cols-12 lg:gap-gutter">
        {/* Seen as "Empower · Enhance · Enrich", heard as a list rather than "dot". */}
        <h2
          id="manifesto-title"
          aria-label={names.join(', ')}
          className="type-eyebrow text-fg-muted lg:col-span-4 lg:pt-4"
        >
          {names.join(' · ')}
        </h2>
        <div className="flex flex-col gap-10 lg:col-span-8 lg:gap-16">
          {statements.map(({ pillar, rest }) => (
            <ScrollText
              key={pillar}
              parts={[{ text: pillar, em: true }, { text: rest }]}
              className="type-h2 text-fg"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
