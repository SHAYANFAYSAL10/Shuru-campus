import { type Amenity } from '@campus/contracts';

import { Marquee } from '@/components/motion/marquee';
import { SectionHeading } from '@/components/sections/section-heading';
import { AmenityGlyph } from '@/lib/amenity-icons';
import { type BentoSpan, bentoSpans } from '@/lib/bento';
import { cn } from '@/lib/cn';

export interface AmenitiesSectionProps {
  amenities: readonly Amenity[];
  /** Position on Home, for the eyebrow. */
  number?: number;
}

const TITLE_ID = 'amenities-title';

// The bento is 3 columns at `md` and 4 at `lg`; spans are worked out for each (lib/bento.ts).
const MD_COLUMNS = 3;
const LG_COLUMNS = 4;
const MD_SPAN: Record<BentoSpan, string> = {
  feature: 'md:col-span-2 md:row-span-2',
  wide: 'md:col-span-2',
  single: '',
};
const LG_SPAN: Record<BentoSpan, string> = {
  feature: 'lg:col-span-2 lg:row-span-2',
  wide: 'lg:col-span-2',
  single: 'lg:col-span-1',
};

/** The 48px icon circle (B3). It fills with accent-subtle and the icon nudges up on hover. */
function AmenityIcon({ icon, inverse = false }: { icon: Amenity['icon']; inverse?: boolean }) {
  return (
    <span
      className={cn(
        'grid size-12 shrink-0 place-items-center rounded-full transition-colors duration-fast ease-out group-hover/tile:bg-accent-subtle group-hover/tile:text-fg',
        inverse ? 'bg-on-brand text-brand-surface' : 'bg-bg-alt text-fg',
      )}
    >
      <AmenityGlyph
        icon={icon}
        aria-hidden="true"
        className="size-6 transition-transform duration-fast ease-out group-hover/tile:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover/tile:translate-y-0"
        strokeWidth={1.5}
      />
    </span>
  );
}

/**
 * Home #5 (docs/05-pages-and-interactions.md): what's on site. A bento grid from `md`, led by
 * the first amenity on the lake band; below `md`, a marquee row with a pause button (a wrapped
 * list without JS or with reduced motion). Renders nothing when there are no amenities: it's a
 * supporting section, so if they fail to load Home simply goes without it.
 */
export function AmenitiesSection({ amenities, number }: AmenitiesSectionProps) {
  if (amenities.length === 0) return null;
  const md = bentoSpans(amenities.length, MD_COLUMNS);
  const lg = bentoSpans(amenities.length, LG_COLUMNS);

  return (
    <section aria-labelledby={TITLE_ID} className="bg-bg-alt">
      <div className="mx-auto max-w-content py-section px-page-safe">
        <SectionHeading
          id={TITLE_ID}
          number={number}
          eyebrow="Amenities"
          title={
            <>
              Everything the day <em>needs</em>.
            </>
          }
          lead="The essentials are already here, so you can get straight to work."
        />

        <Marquee
          label="Amenities"
          className="mt-10 md:hidden"
          items={amenities.map((amenity) => (
            // A surface chip, so the icon circle shows against the section's bg-alt.
            <span
              key={amenity.id}
              className="inline-flex items-center gap-3 rounded-full border border-border bg-surface p-1.5 pr-5 text-fg"
            >
              <AmenityIcon icon={amenity.icon} />
              <span className="font-medium whitespace-nowrap">{amenity.name}</span>
            </span>
          ))}
        />

        <ul
          aria-label="Amenities"
          className="mt-14 hidden grid-flow-dense auto-rows-fr gap-4 md:grid md:grid-cols-3 lg:grid-cols-4 lg:gap-gutter"
        >
          {amenities.map((amenity, i) => {
            const feature = md[i] === 'feature' || lg[i] === 'feature';
            return (
              <li
                key={amenity.id}
                className={cn(
                  'group/tile flex flex-col gap-8 rounded-md border p-6',
                  feature
                    ? 'border-transparent surface-brand dark:border-border'
                    : 'border-border bg-surface',
                  MD_SPAN[md[i] ?? 'single'],
                  LG_SPAN[lg[i] ?? 'single'],
                )}
              >
                <AmenityIcon icon={amenity.icon} inverse={feature} />
                <div className="mt-auto">
                  <h3 className={feature ? 'type-h3' : 'font-medium text-fg'}>{amenity.name}</h3>
                  <p className={cn('mt-1', feature ? 'type-lead' : 'text-small text-fg-muted')}>
                    {amenity.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
