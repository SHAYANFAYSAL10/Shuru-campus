import { notFound } from 'next/navigation';

import { GalleryBrowser } from '@/components/gallery/gallery-browser';
import { GalleryNotice } from '@/components/gallery/gallery-notice';
import { getBrand, getGallery, getSiteSettings } from '@/lib/api';
import { CATEGORY_PARAM, parseCategory } from '@/lib/gallery';
import { pageMetadata } from '@/lib/metadata';

import type { Metadata } from 'next';

const PATH = '/gallery';
/** Where the chips land without JS: the photos, under the intro. */
const PHOTOS_ID = 'photos';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return pageMetadata(brand, {
    title: 'Gallery',
    description:
      'Photos of the workspace, meeting rooms, café and events at our co-working space in Gulshan, Dhaka.',
    path: PATH,
  });
}

/**
 * Gallery (docs/05-pages-and-interactions.md → Gallery): the intro, then every photo as a
 * masonry, filtered by chips. The page reads `?category=` on the server, so a shared or no-JS
 * filtered link arrives already filtered; after that the filter runs in the browser. With
 * `features.gallery` off the page doesn't exist (404), like its nav link.
 */
export default async function GalleryPage({ searchParams }: PageProps<'/gallery'>) {
  const [site, gallery, query] = await Promise.all([getSiteSettings(), getGallery(), searchParams]);
  if (!site.features.gallery) notFound();

  return (
    <div className="mx-auto max-w-content pt-12 px-page-safe pb-section sm:pt-16 lg:pt-24">
      <header>
        <p className="type-eyebrow text-fg-subtle">Gallery</p>
        {/* 20ch: the display measure (B1). */}
        <h1 className="mt-4 max-w-[20ch] type-h1 text-balance text-fg">
          Take a look <em>around</em>.
        </h1>
        <p className="mt-6 max-w-2xl type-lead text-pretty text-fg-muted">
          The desks, rooms and corners you’d work in, from the open workspace to the café counter.
        </p>
      </header>

      <section id={PHOTOS_ID} aria-label="Photos" className="mt-10 lg:mt-14">
        {gallery.ok && gallery.data.length > 0 ? (
          <GalleryBrowser
            images={gallery.data}
            initialCategory={parseCategory(query[CATEGORY_PARAM])}
            action={`${PATH}#${PHOTOS_ID}`}
          />
        ) : (
          <GalleryNotice reason={gallery.ok ? 'empty' : 'error'} />
        )}
      </section>
    </div>
  );
}
