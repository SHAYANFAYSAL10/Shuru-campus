'use client';

import { ImageOff } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import Image from 'next/image';
import { useState, type MouseEvent } from 'react';

import { type GalleryCategory, type GalleryImage } from '@campus/contracts';

import { buttonClasses } from '@/components/ui/button-classes';
import { Chip } from '@/components/ui/chip';
import {
  CATEGORY_PARAM,
  categoryInfo,
  filterGallery,
  GALLERY_FILTERS,
  gallerySummary,
  suggestCategory,
} from '@/lib/gallery';
import { useReducedMotion } from '@/lib/hooks/use-media-query';
import { ease, seconds } from '@/styles/motion';

// One column on phones, two from `sm`, three from `lg` (inside the 90rem container less its margins).
const SIZES = '(min-width: 90rem) 26rem, (min-width: 64rem) 30vw, (min-width: 40rem) 46vw, 92vw';
/** Photos that load straight away: the top of every column at three columns, give or take. */
const EAGER = 4;

export interface GalleryBrowserProps {
  images: readonly GalleryImage[];
  /** From `?category=`, read by the page, so the server HTML is already filtered. */
  initialCategory: GalleryCategory | undefined;
  /** Where the chips submit without JS: this page, at the photos. */
  action: string;
}

/**
 * The Gallery's chips and photos (docs/05-pages-and-interactions.md → Gallery). The chips are
 * submit buttons of a GET form, so without JS a chip reloads the page filtered by `?category=`;
 * with JS it filters in place, replaces `?category=` (no new history entry) and says what's
 * showing in a polite live region. The photos are a CSS-columns masonry (no JS layout) at their
 * own ratios; on a change, leaving photos fade out and the rest glide to their new places
 * (`layout`, transform only). Reduced motion keeps the fades, shortened, and drops the glide.
 * T6.6 turns each photo into a button that opens the lightbox.
 */
export function GalleryBrowser({ images, initialCategory, action }: GalleryBrowserProps) {
  const [category, setCategoryState] = useState(initialCategory);
  // Set by the first change, so nothing fades in on first paint (the HTML arrives filtered).
  const [changed, setChanged] = useState(false);
  const reduced = useReducedMotion();
  const shown = filterGallery(images, category);
  const suggestion = category && shown.length === 0 ? suggestCategory(images, category) : undefined;

  const choose = (next: GalleryCategory | undefined) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setCategoryState(next);
    setChanged(true);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set(CATEGORY_PARAM, next);
    else url.searchParams.delete(CATEGORY_PARAM);
    // Next.js syncs its router with replaceState, so this stays a soft URL update.
    window.history.replaceState(null, '', url);
  };

  const fade = { duration: seconds(reduced ? 'crossfade' : 'base'), ease: ease.out };

  return (
    <form
      method="get"
      action={action}
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <fieldset className="min-w-0">
        <legend className="sr-only">Show photos of</legend>
        <div className="flex flex-wrap gap-2">
          {/* No name: without JS it submits an empty query, which is every photo. */}
          <Chip type="submit" selected={category === undefined} onClick={choose(undefined)}>
            All
          </Chip>
          {GALLERY_FILTERS.map((filter) => (
            <Chip
              key={filter.value}
              type="submit"
              name={CATEGORY_PARAM}
              value={filter.value}
              selected={category === filter.value}
              onClick={choose(filter.value)}
            >
              {filter.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <p aria-live="polite" className="mt-6 flex min-h-hit items-center text-small text-fg-muted">
        {gallerySummary(category, shown.length)}
      </p>

      {shown.length > 0 ? (
        // `relative`: leaving photos are lifted out of the flow (popLayout) and placed against it.
        <ul className="relative mt-4 columns-1 gap-gutter sm:columns-2 lg:columns-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((image, index) => (
              <m.li
                key={image.id}
                layout={!reduced}
                initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: reduced ? 1 : 0.96,
                  // Exits are quicker than entrances (04 §6).
                  transition: { duration: seconds(reduced ? 'crossfade' : 'fast'), ease: ease.in },
                }}
                transition={{ ...fade, layout: { duration: seconds('base'), ease: ease.out } }}
                className="mb-gutter break-inside-avoid"
              >
                <Image
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={image.alt}
                  sizes={SIZES}
                  placeholder="blur"
                  blurDataURL={image.blurDataUrl}
                  loading={index < EAGER ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : undefined}
                  className="block h-auto w-full rounded-sm bg-bg-alt photo-tone"
                />
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : category ? (
        <m.div
          initial={changed ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={fade}
          className="mt-4 flex flex-col items-center gap-4 rounded-md border border-dashed border-border-strong px-6 py-16 text-center"
        >
          <ImageOff aria-hidden="true" className="size-12 text-fg-subtle" strokeWidth={1} />
          <p className="max-w-sm text-fg">
            Nothing in <em>{categoryInfo(category).label}</em> yet.
            {suggestion ? (
              <>
                {' '}
                Try <em>{categoryInfo(suggestion).label}</em>.
              </>
            ) : null}
          </p>
          <button
            type="submit"
            name={suggestion ? CATEGORY_PARAM : undefined}
            value={suggestion}
            onClick={(event) => {
              // The button leaves with the empty state, so hand focus to the chip it chose.
              const form = event.currentTarget.form;
              choose(suggestion)(event);
              const chips = form?.querySelectorAll<HTMLButtonElement>('fieldset button');
              const target = suggestion
                ? GALLERY_FILTERS.findIndex((filter) => filter.value === suggestion) + 1
                : 0;
              chips?.[target]?.focus();
            }}
            className={buttonClasses({ variant: 'secondary', size: 'sm' })}
          >
            {suggestion ? `Show ${categoryInfo(suggestion).label}` : 'Show all photos'}
          </button>
        </m.div>
      ) : null}
    </form>
  );
}
