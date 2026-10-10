'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, type PanInfo } from 'motion/react';
import * as m from 'motion/react-m';
import Image, { getImageProps } from 'next/image';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { type GalleryImage } from '@campus/contracts';

import { IconButton } from '@/components/ui/icon-button';
import { isOnScreen, type LineBox } from '@/lib/begin-line-handoff';
import { cn } from '@/lib/cn';
import { categoryInfo } from '@/lib/gallery';
import { MEDIA } from '@/lib/hooks/use-media-query';
import {
  keyStep,
  lightboxCounter,
  lightboxSizes,
  lightboxStatus,
  neighbourIndices,
  swipeStep,
  wrapIndex,
  type LightboxStep,
} from '@/lib/lightbox';
import { coverTransform } from '@/lib/plan-morph';
import { cssEase, duration, ease, lightbox, seconds } from '@/styles/motion';

// Marks the bars and buttons, which fade in with the backdrop and out before the photo lands.
const CHROME = 'data-lightbox-chrome';
const chrome = { [CHROME]: '' } as const;
// Marks the photo itself, which a tap doesn't close on.
const PHOTO = 'data-lightbox-photo';

function boxOf(element: Element): LineBox {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
}

function reducedMotion(): boolean {
  return window.matchMedia(MEDIA.reducedMotion).matches;
}

/** Plays an animation and resolves when it ends (at once where there's no Web Animations API). */
function play(
  element: Element | null | undefined,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Promise<void> {
  if (!element || typeof element.animate !== 'function') return Promise.resolve();
  return element.animate(keyframes, { fill: 'forwards', ...options }).finished.then(
    () => undefined,
    () => undefined,
  );
}

/**
 * Keyframes that lay the viewer's photo over its thumbnail and then let it land: an even scale
 * from its top-left, cropped to the thumbnail's shape and corners (transform and clip-path only).
 * `null` when the thumbnail isn't on screen, so there's nowhere to zoom from.
 */
function zoomKeyframes(thumbnail: Element | null | undefined, photo: Element): Keyframe[] | null {
  if (!thumbnail) return null;
  const from = boxOf(thumbnail);
  if (!isOnScreen(from, { width: window.innerWidth, height: window.innerHeight })) return null;
  const move = coverTransform(from, boxOf(photo));
  if (!move) return null;
  const { x, y, scale, insetX, insetY } = move;
  const fromRadius = Number.parseFloat(getComputedStyle(thumbnail).borderTopLeftRadius) || 0;
  const toRadius = getComputedStyle(photo).borderTopLeftRadius;
  return [
    {
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      clipPath: `inset(${insetY}px ${insetX}px round ${fromRadius / scale}px)`,
    },
    { transform: 'none', clipPath: `inset(0 round ${toRadius})` },
  ];
}

const SETTLED: Keyframe = { opacity: 1, transform: 'none' };
const AWAY: Keyframe = { opacity: 0, transform: `scale(${lightbox.settle})` };

/** Warms the cache with the image a photo will show at, so stepping to it shows it at once. */
function preload(image: GalleryImage) {
  const { props } = getImageProps({
    src: image.src,
    alt: '',
    fill: true,
    sizes: lightboxSizes(image),
  });
  const img = new window.Image();
  // `sizes` before `srcset`, so the browser picks the same candidate the viewer will.
  if (props.sizes) img.sizes = props.sizes;
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
}

export interface GalleryLightboxProps {
  /** The photos the grid shows (the current filter), in its order. */
  images: readonly GalleryImage[];
  /** The photo it opens on. */
  initialIndex: number;
  /**
   * A photo's thumbnail link in the grid: where the photo zooms out of and back into, and where
   * focus returns on close (on the photo last seen, which may not be the one opened).
   */
  thumbnail: (id: string) => HTMLElement | null;
  /** Called once the viewer has finished closing. */
  onClose: () => void;
}

/**
 * The Gallery's lightbox (docs/04-design-system.md §6, signature moment 6). A modal dialog
 * (Radix: focus trapped, Esc closes, page scroll locked) on a night backdrop in either theme. The
 * photo zooms out of its thumbnail and, on close, back into the thumbnail of the photo last
 * seen (or settles out when that one is off screen). Arrow keys, Home/End, the buttons and a
 * horizontal swipe step through the grid's photos, round from either end; the neighbours
 * preload. A counter and caption (the photo's alt text and category) frame it, and a polite
 * status reads out each change. Reduced motion: crossfades only.
 */
export function GalleryLightbox({
  images,
  initialIndex,
  thumbnail,
  onClose,
}: GalleryLightboxProps) {
  const [step, setStep] = useState<LightboxStep>({
    index: wrapIndex(initialIndex, images.length),
    direction: 1,
  });
  const [closing, setClosing] = useState(false);
  const [reduced] = useState(reducedMotion);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const photos = useRef(new Map<string, HTMLDivElement>());
  const zoomed = useRef(false);

  const { index, direction } = step;
  const image = images[index];
  const count = images.length;
  const many = count > 1;

  useEffect(() => {
    for (const neighbour of neighbourIndices(index, count)) {
      const next = images[neighbour];
      if (next) preload(next);
    }
  }, [images, index, count]);

  if (!image) return null;
  const current = image;

  const thumbImage = (id: string) => thumbnail(id)?.querySelector('img');

  function go(target: LightboxStep) {
    if (closing || target.index === index) return;
    setStep(target);
  }
  const previous = () => {
    go({ index: wrapIndex(index - 1, count), direction: -1 });
  };
  const next = () => {
    go({ index: wrapIndex(index + 1, count), direction: 1 });
  };

  // The photo it opened on zooms out of its thumbnail, once, as it first mounts.
  function zoomIn(photo: HTMLDivElement, id: string) {
    if (zoomed.current) return;
    zoomed.current = true;
    if (reduced) return;
    const keyframes = zoomKeyframes(thumbImage(id), photo) ?? [AWAY, SETTLED];
    void play(photo, keyframes, { duration: duration.slow, easing: cssEase('out'), fill: 'none' });
  }

  async function close() {
    if (closing) return;
    setClosing(true);
    const photo = photos.current.get(current.id);
    const faded = [
      overlayRef.current,
      ...(contentRef.current?.querySelectorAll(`[${CHROME}]`) ?? []),
    ];
    if (reduced) {
      const fade = { duration: duration.crossfade, easing: 'linear' };
      await Promise.all([photo, ...faded].map((el) => play(el, [{ opacity: 0 }], fade)));
    } else {
      const zoom = photo ? zoomKeyframes(thumbImage(current.id), photo) : null;
      const timing = zoom
        ? { duration: duration.base, easing: cssEase('inOut') }
        : { duration: duration.fast, easing: cssEase('in') };
      await Promise.all([
        play(photo, zoom ? [...zoom].reverse() : [SETTLED, AWAY], timing),
        ...faded.map((el) => play(el, [{ opacity: 0 }], timing)),
      ]);
    }
    onClose();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = keyStep(event.key, index, count);
    if (!target) return;
    event.preventDefault();
    go(target);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    const width = stageRef.current?.clientWidth ?? 0;
    const move = swipeStep(info.offset.x, info.velocity.x, width);
    if (move === 1) next();
    else if (move === -1) previous();
  }

  const slide = (dir: number) => `${String(reduced ? 0 : dir * lightbox.slide * 100)}%`;
  const variants = {
    enter: (dir: number) => ({ x: slide(dir), opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: slide(-dir), opacity: 0 }),
  };
  const transition = {
    duration: seconds(reduced ? 'crossfade' : 'base'),
    ease: ease.out,
  };
  const ratio = current.width / current.height;
  const chromeIn = 'animate-overlay-in motion-reduce:animate-fade-in';

  const navButton = (side: 'previous' | 'next', className: string) => (
    <IconButton
      label={side === 'previous' ? 'Previous photo' : 'Next photo'}
      icon={side === 'previous' ? ChevronLeft : ChevronRight}
      variant="secondary"
      onClick={side === 'previous' ? previous : next}
      className={cn(chromeIn, className)}
      {...chrome}
    />
  );

  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) void close();
      }}
    >
      <DialogPrimitive.Portal>
        {/* `dark`: photos are viewed on night in either theme; the tokens follow the scope. */}
        <DialogPrimitive.Overlay
          ref={overlayRef}
          className="dark fixed inset-0 z-modal animate-overlay-in bg-bg motion-reduce:animate-fade-in"
        />
        <DialogPrimitive.Content
          ref={contentRef}
          aria-describedby={undefined}
          onKeyDown={onKeyDown}
          onCloseAutoFocus={(event) => {
            // Back to the photo last seen, scrolling it into view if the reader went far.
            event.preventDefault();
            thumbnail(current.id)?.focus();
          }}
          className={cn(
            // Rows: the counter bar, the photo (takes what's left, and may shrink to nothing), the caption bar.
            'dark fixed inset-0 z-modal grid grid-rows-[auto_minmax(0,1fr)_auto] gap-2 pt-safe px-safe pb-safe text-fg outline-none',
            closing && 'pointer-events-none',
          )}
        >
          <DialogPrimitive.Title className="sr-only">Photo viewer</DialogPrimitive.Title>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {lightboxStatus(index, count, current.alt)}
          </p>

          <div className={cn('flex items-center justify-between gap-4', chromeIn)} {...chrome}>
            <p aria-hidden="true" className="type-eyebrow text-fg-muted tabular-nums">
              {lightboxCounter(index, count)}
            </p>
            {/* No tooltip: the dialog focuses this button on open, and one would pop up every time. */}
            <DialogPrimitive.Close asChild>
              <IconButton label="Close photo viewer" icon={X} tooltip={false} className="-mr-2" />
            </DialogPrimitive.Close>
          </div>

          {/* From `md` the buttons flank the photo: they keep their size, the photo takes the rest. */}
          <div className="grid min-h-0 grid-cols-1 items-center gap-gutter md:grid-cols-[auto_minmax(0,1fr)_auto]">
            {many ? navButton('previous', 'hidden md:inline-flex') : null}
            {/* A size container: the photo fits it by `cqw`/`cqh`, like `object-fit: contain`. */}
            <div ref={stageRef} className="[container-type:size] relative h-full min-h-0">
              <AnimatePresence initial={false} custom={direction}>
                <m.div
                  key={current.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                  drag={many && !closing ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={onDragEnd}
                  onTap={(event) => {
                    // A tap on the backdrop around the photo closes; on the photo it doesn't.
                    const { target } = event;
                    if (target instanceof Element && !target.closest(`[${PHOTO}]`)) void close();
                  }}
                  className="absolute inset-0 grid place-items-center"
                >
                  <div
                    ref={(element) => {
                      if (!element) return;
                      photos.current.set(current.id, element);
                      zoomIn(element, current.id);
                      return () => {
                        photos.current.delete(current.id);
                      };
                    }}
                    {...{ [PHOTO]: '' }}
                    className="relative origin-top-left overflow-hidden rounded-sm bg-bg-alt"
                    style={{
                      aspectRatio: `${String(current.width)} / ${String(current.height)}`,
                      width: `min(100cqw, ${String(ratio)} * 100cqh)`,
                    }}
                  >
                    <LightboxPhoto image={current} thumbnail={thumbImage(current.id)} />
                  </div>
                </m.div>
              </AnimatePresence>
            </div>
            {many ? navButton('next', 'hidden md:inline-flex') : null}
          </div>

          <div className={cn('flex items-center gap-4', chromeIn)} {...chrome}>
            {many ? navButton('previous', 'md:hidden') : null}
            {/* Not read again: the photo's alt and the status already say it. */}
            <div aria-hidden="true" className="flex min-w-0 flex-1 flex-col items-center gap-1">
              {/* Room for two lines on phones, so a longer caption does not shrink the photo as it
                  changes. From `md` a caption fits one line, and short landscape screens need the room. */}
              <p className="flex min-h-[2lh] max-w-prose items-center text-center text-small text-pretty text-fg md:min-h-0">
                {current.alt}
              </p>
              <p className="type-eyebrow text-fg-subtle">{categoryInfo(current.category).label}</p>
            </div>
            {many ? navButton('next', 'md:hidden') : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * The photo, at the size it's viewed at. Behind it, the thumbnail's already-loaded image, so the
 * zoom shows the photo at once and the sharper one simply settles over it as it arrives.
 */
function LightboxPhoto({
  image,
  thumbnail,
}: {
  image: GalleryImage;
  thumbnail: HTMLImageElement | null | undefined;
}) {
  // Read once: the grid's image may change its `currentSrc` later, but this one is in the cache.
  const [underlay] = useState(() => thumbnail?.currentSrc ?? '');
  return (
    <>
      {underlay ? (
        // A plain img: the exact file the grid already loaded, not a new `next/image` request.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={underlay}
          alt=""
          draggable={false}
          className="absolute inset-0 size-full object-cover photo-tone"
        />
      ) : null}
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={lightboxSizes(image)}
        loading="eager"
        fetchPriority="high"
        draggable={false}
        placeholder={underlay ? 'empty' : 'blur'}
        blurDataURL={image.blurDataUrl}
        className="object-cover photo-tone select-none"
      />
    </>
  );
}
