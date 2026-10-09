import Image from 'next/image';

import { Link } from '@/components/ui/link';
import { ABOUT_STORY_MEDIA } from '@/lib/about-media';

export interface AboutStoryProps {
  /** `brand.shortName`, for the running copy. */
  shortName: string;
}

const TITLE_ID = 'story-title';

// 7 of 12 columns from `lg` (the 1440px container less its margins), the full width below.
const SIZES = '(min-width: 100rem) 47rem, (min-width: 64rem) 55vw, 90vw';

/**
 * About, first screen (docs/05-pages-and-interactions.md → About): the page's `h1` ("We are
 * dreamers", from the About copy's "Who we are"), then the story beside an editorial 3:2 photo
 * (B4). The copy is the reference About text (docs/02-content.md), refreshed. The photo is
 * likely the LCP element on wide screens, so it loads eagerly at high priority.
 */
export function AboutStory({ shortName }: AboutStoryProps) {
  return (
    <div className="mx-auto max-w-content pt-8 px-page-safe pb-section sm:pt-12 lg:pt-16">
      <header className="max-w-3xl">
        <p className="type-eyebrow text-fg-subtle">About</p>
        {/* 20ch: the display measure (B1). */}
        <h1 className="mt-4 max-w-[20ch] type-h1 text-balance text-fg">
          We are <em>dreamers</em>.
        </h1>
        <p className="mt-4 max-w-xl type-lead text-pretty text-fg-muted">
          We use imagination and creativity to make the journey of a business, or an entrepreneur, a
          little simpler.
        </p>
      </header>

      <section
        aria-labelledby={TITLE_ID}
        className="mt-10 grid items-end gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-gutter"
      >
        <div className="overflow-hidden rounded-lg bg-bg-alt lg:col-span-7">
          <Image
            src={ABOUT_STORY_MEDIA.src}
            width={ABOUT_STORY_MEDIA.width}
            height={ABOUT_STORY_MEDIA.height}
            alt={ABOUT_STORY_MEDIA.alt}
            sizes={SIZES}
            loading="eager"
            fetchPriority="high"
            className="block aspect-3/2 h-auto w-full object-cover photo-tone"
          />
        </div>

        <div className="flex flex-col lg:col-span-5">
          <h2 id={TITLE_ID} className="type-h3 text-balance text-fg">
            A workspace, and a little <em>beyond</em>.
          </h2>
          <div className="mt-4 flex max-w-prose flex-col gap-4 text-pretty text-fg-muted">
            <p>
              {shortName} is a co-working space for businesses, entrepreneurs and independent
              professionals. You share a common workspace and its office services, in an atmosphere
              we keep professional, tranquil and buoyant.
            </p>
            <p>
              Looking for a head-start, or about to start a company? Need space right away, or
              somewhere to work while you travel? Tell us what you’re facing, and let us help you
              sort it out.
            </p>
          </div>
          <Link href="/spaces" variant="standalone" className="mt-8 min-h-hit self-start">
            See spaces & pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
