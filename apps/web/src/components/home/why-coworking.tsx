import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from '@/components/sections/section-heading';
import { Link } from '@/components/ui/link';
import { EXPLAINERS } from '@/lib/explainers';

export interface WhyCoworkingProps {
  /** Position on Home, for the eyebrow. */
  number?: number;
}

const TITLE_ID = 'why-coworking-title';

/**
 * Home #8 (docs/05-pages-and-interactions.md): the two ideas behind the space as editorial
 * columns. Each opens with its definition as a pull quote, cited and linked to its source, then
 * says what it means here. Quotes reveal as they scroll in (progressive: visible without JS).
 */
export function WhyCoworking({ number }: WhyCoworkingProps) {
  return (
    <section
      aria-labelledby={TITLE_ID}
      className="mx-auto grid max-w-content gap-12 py-section px-page-safe lg:grid-cols-12 lg:gap-gutter"
    >
      <SectionHeading
        id={TITLE_ID}
        number={number}
        eyebrow="Why co-working"
        title={
          <>
            Why <em>share</em> a workspace?
          </>
        }
        className="lg:col-span-4"
      />

      <div className="grid gap-12 md:grid-cols-2 md:gap-gutter lg:col-span-8">
        {EXPLAINERS.map((explainer, i) => (
          <article
            key={explainer.id}
            aria-labelledby={`explainer-${explainer.id}`}
            className="flex flex-col border-t border-border pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-gutter"
          >
            <h3 id={`explainer-${explainer.id}`} className="type-eyebrow text-fg-muted">
              {explainer.title}
            </h3>
            <Reveal index={i} className="mt-6">
              <figure>
                <blockquote cite={explainer.source.url} className="type-pullquote text-fg">
                  <p>“{explainer.quote}”</p>
                </blockquote>
                <figcaption className="mt-4 text-small text-fg-muted">
                  —{' '}
                  <Link href={explainer.source.url} external>
                    {explainer.source.name}
                  </Link>
                </figcaption>
              </figure>
            </Reveal>
            <p className="mt-8 max-w-prose text-fg-muted">{explainer.here}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
