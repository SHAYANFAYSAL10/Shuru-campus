import { type Brand } from '@campus/contracts';

import { Reveal } from '@/components/motion/reveal';
import { manifestoStatements } from '@/lib/manifesto';

/**
 * Home #2 (docs/05-pages-and-interactions.md): the brand's pillars as the section title, then
 * one large statement per pillar, each opening with the pillar itself. Statements reveal as they
 * scroll in (progressive: visible without JS); T6.7 makes them scroll-linked. Renders nothing when
 * no pillar has a statement (a renamed brand).
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
          {statements.map(({ pillar, rest }, i) => (
            <Reveal key={pillar} index={i}>
              <p className="type-h2 text-fg">
                <em>{pillar}</em> {rest}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
