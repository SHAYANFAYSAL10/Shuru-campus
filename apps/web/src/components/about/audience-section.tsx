import {
  ArrowRight,
  Briefcase,
  Laptop,
  type LucideIcon,
  Presentation,
  UsersRound,
} from 'lucide-react';
import NextLink from 'next/link';

import { type Plan } from '@campus/contracts';

import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from '@/components/sections/section-heading';
import { Price } from '@/components/ui/price';
import { type Audience, audienceTiles } from '@/lib/audiences';
import { cn } from '@/lib/cn';

export interface AudienceSectionProps {
  /** `null` when the plans failed to load: the tiles then lead to Spaces, without prices. */
  plans: readonly Plan[] | null;
}

const TITLE_ID = 'audience-title';

const ICONS: Record<Audience['id'], LucideIcon> = {
  independents: Laptop,
  founders: Briefcase,
  teams: UsersRound,
  events: Presentation,
};

/**
 * The CTA with its arrow (A6: standalone link) held to the last word, so a CTA that wraps in a
 * narrow tile keeps the arrow beside the text instead of stranding it at the edge.
 */
function CtaText({ text }: { text: string }) {
  const words = text.split(' ');
  const last = words.pop();
  return (
    <>
      {words.length > 0 ? `${words.join(' ')} ` : null}
      <span className="whitespace-nowrap">
        {last}
        <ArrowRight
          aria-hidden="true"
          // -0.125em: centres the 1em-tall icon on the text's x-height rather than its baseline.
          className="ml-1.5 inline size-4 align-[-0.125em] transition-transform duration-fast ease-out group-hover/tile:translate-x-0.5 motion-reduce:transition-none"
          strokeWidth={1.5}
        />
      </span>
    </>
  );
}

/**
 * About, "Who it's for" (docs/05-pages-and-interactions.md → About): four audience tiles, each
 * saying what that audience needs and linking to the plan that answers it, with its "from"
 * price. Each tile is a single link (the CTA stretches over the card), named by its destination
 * ("See Hot Desk pricing", B5); the title and need are read as the card's content before it.
 */
export function AudienceSection({ plans }: AudienceSectionProps) {
  const tiles = audienceTiles(plans);

  return (
    <section aria-labelledby={TITLE_ID} className="bg-bg-alt">
      <div className="mx-auto max-w-content py-section px-page-safe">
        <SectionHeading
          id={TITLE_ID}
          eyebrow="Who it’s for"
          title={
            <>
              Room for every kind of <em>work</em>.
            </>
          }
          lead="Just you, a growing team or a room full of people: there’s a plan that fits."
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-gutter">
          {tiles.map((tile, i) => {
            const Icon = ICONS[tile.id];
            return (
              <li key={tile.id} className="flex">
                <Reveal index={i} className="flex w-full">
                  <article
                    aria-labelledby={`audience-${tile.id}`}
                    className={cn(
                      'group/tile relative flex w-full flex-col rounded-md border border-border bg-surface p-6 focus-ring-within',
                      // Hover (A6: Card): lifts, and the raise shadow fades in on a pseudo-element
                      // (opacity only, never box-shadow itself).
                      'transition-transform duration-base ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                      'before:pointer-events-none before:absolute before:inset-0 before:rounded-md before:opacity-0 before:shadow-raise before:transition-opacity before:duration-base before:ease-out hover:before:opacity-100',
                    )}
                  >
                    {/* The 48px icon circle (B3): fills with accent-subtle on hover. */}
                    <span className="grid size-12 place-items-center rounded-full bg-bg-alt text-fg transition-colors duration-fast ease-out group-hover/tile:bg-accent-subtle">
                      <Icon
                        aria-hidden="true"
                        className="size-6 transition-transform duration-fast ease-out group-hover/tile:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover/tile:translate-y-0"
                        strokeWidth={1.5}
                      />
                    </span>
                    <h3 id={`audience-${tile.id}`} className="mt-8 font-medium text-pretty text-fg">
                      {tile.title}
                    </h3>
                    <p className="mt-2 text-small text-pretty text-fg-muted">{tile.need}</p>

                    <div className="mt-auto flex flex-col gap-2 pt-6">
                      {tile.from ? (
                        <p className="flex items-baseline gap-1.5 text-fg">
                          <span className="text-small text-fg-muted">From</span>
                          <Price
                            amount={tile.from.amountBdt}
                            rate={tile.from}
                            size="sm"
                            className="font-medium"
                          />
                        </p>
                      ) : null}
                      {/* The stretched link (as PlanCard): its ::after covers the card, so all of
                          it clicks through and the card is the touch target; the card draws the
                          focus ring (focus-ring-within). Not the standalone Link: link-draw makes
                          it the positioned box and claims its ::after. */}
                      <NextLink
                        href={tile.href}
                        className="font-medium text-pretty text-fg outline-none after:absolute after:inset-0 after:rounded-md"
                      >
                        <CtaText text={tile.cta} />
                      </NextLink>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
