import { NotFoundSection } from '@/components/sections/not-found-section';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page not found' };

/** `notFound()` in a public page (e.g. an unknown plan slug), inside the site shell. */
export default function NotFound() {
  return <NotFoundSection />;
}
