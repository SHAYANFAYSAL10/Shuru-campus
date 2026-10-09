import { type Brand } from '@campus/contracts';

import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from '@/components/sections/section-heading';
import { cn } from '@/lib/cn';
import { pillarStatement } from '@/lib/manifesto';
import { sentence } from '@/lib/metadata';

export interface PillarsSectionProps {
  pillars: Brand['pillars'];
  /** `brand.subTagline`, the lead. */
  subTagline: Brand['subTagline'];
}

const TITLE_ID = 'pillars-title';

// One row from `lg`: the brand has one to four pillars (Brand schema).
const LG_COLUMNS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

/**
 * About, the pillars (docs/05-pages-and-interactions.md → About): one numbered column per brand
 * pillar, with what it means here (`lib/manifesto.ts`, shared with Home's manifesto). A pillar
 * without a statement (a renamed brand) still gets its column, just without the sentence.
 */
export function PillarsSection({ pillars, subTagline }: PillarsSectionProps) {
  return (
    <section aria-labelledby={TITLE_ID} className="bg-bg-alt">
      <div className="mx-auto max-w-content py-section px-page-safe">
        <SectionHeading
          id={TITLE_ID}
          eyebrow="Our pillars"
          title={
            <>
              What we <em>stand</em> for.
            </>
          }
          lead={sentence(subTagline)}
        />

        <ol
          className={cn(
            'mt-10 grid gap-10 md:grid-cols-2 md:gap-gutter lg:mt-14',
            LG_COLUMNS[pillars.length],
          )}
        >
          {pillars.map((pillar, i) => {
            const statement = pillarStatement(pillar);
            return (
              <li key={`${i}-${pillar}`} className="border-t border-border-strong pt-6">
                <Reveal index={i}>
                  <p aria-hidden="true" className="type-eyebrow text-fg-subtle tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 type-h2 text-fg">
                    <em>{pillar.trim()}</em>
                  </h3>
                  {statement ? (
                    <p className="mt-4 max-w-prose text-pretty text-fg-muted">
                      {pillar.trim()} {statement}
                    </p>
                  ) : null}
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
