import { Skeleton } from '@/components/ui/skeleton';

/**
 * The loading pattern for a public page (B6: skeletons shaped like the page, no spinners): an
 * eyebrow, a two-line headline, a lead paragraph and a row of cards. It fades in only after a
 * beat, so fast navigations never flash it. Announced once as "Loading page".
 *
 * The delay is the `--duration-base` token, as an arbitrary property because Tailwind has no
 * animation-delay utility.
 */
export function PageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto max-w-content animate-fade-in py-section px-page-safe [animation-delay:var(--duration-base)]"
    >
      <span className="sr-only">Loading page</span>
      <Skeleton className="h-4 w-32" />
      {/* 1em at the h1 size: line boxes as tall as the headline that replaces them. */}
      <div className="mt-6 flex max-w-4xl flex-col gap-3 text-h1">
        <Skeleton className="h-[1em] w-full" />
        <Skeleton className="h-[1em] w-3/5" />
      </div>
      <div className="mt-10 flex max-w-xl flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="mt-section grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          // Portrait cards, 4:5 (04 §7).
          <Skeleton key={key} className="aspect-4/5 rounded-md" />
        ))}
      </div>
    </div>
  );
}
