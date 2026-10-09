import { getImageProps } from 'next/image';

import { cn } from '@/lib/cn';
import { HERO_MEDIA } from '@/lib/hero-media';

// Content width: the 1440px container less its page margins (5vw each side, at most 80px).
const SIZES = '(min-width: 100rem) 80rem, 90vw';

/**
 * The hero photo, art-directed with `<picture>` (B4): 4:5 below `md`, 16:9 from it. It's the
 * likely LCP element, so it loads eagerly at high priority and is never hidden: it only settles
 * from 1.05 to 1, and holds still under reduced motion. The `bg-alt` frame holds its space until it loads.
 */
export function HeroImage({ className }: { className?: string }) {
  const common = {
    alt: HERO_MEDIA.alt,
    sizes: SIZES,
    loading: 'eager',
    fetchPriority: 'high',
  } as const;
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, ...HERO_MEDIA.wide });
  const { props: tall } = getImageProps({ ...common, ...HERO_MEDIA.tall });

  return (
    <div className={cn('overflow-hidden rounded-lg bg-bg-alt', className)}>
      <picture>
        <source media="(min-width: 48rem)" srcSet={wide} />
        {/* A plain <img>: art direction needs <picture>; getImageProps supplies the optimized srcSet. */}
        <img
          {...tall}
          alt={HERO_MEDIA.alt}
          className="block aspect-4/5 h-auto w-full animate-settle object-cover photo-tone motion-reduce:animate-none md:aspect-video"
        />
      </picture>
    </div>
  );
}
