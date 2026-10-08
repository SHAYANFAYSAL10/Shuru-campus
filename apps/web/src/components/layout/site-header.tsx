import { ArrowUpRight } from 'lucide-react';
import NextLink from 'next/link';

import { HeaderShell } from '@/components/layout/header-shell';
import { PrimaryNav } from '@/components/layout/primary-nav';
import { buttonClasses } from '@/components/ui/button-classes';
import { Logo } from '@/components/ui/logo';
import { OpenStatus } from '@/components/ui/open-status';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { getSiteSettings } from '@/lib/api';
import { cn } from '@/lib/cn';
import { BOOK_VISIT_HREF, primaryNav } from '@/lib/navigation';

/** Id of the page's `<main>`, the skip link's target. */
export const MAIN_CONTENT_ID = 'main';

/**
 * The public site header (docs/05-pages-and-interactions.md): logo, nav, open status, theme
 * toggle, member login and the "Book a visit" CTA. Below `lg` the nav, theme toggle and member
 * login move into the mobile menu. A Server Component; only the scroll shell, the nav (current
 * page) and the live widgets are client islands.
 */
export async function SiteHeader() {
  const site = await getSiteSettings();

  return (
    <HeaderShell>
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className={cn(
          buttonClasses({ variant: 'secondary', size: 'sm' }),
          'absolute top-full left-page bg-surface not-focus:sr-only',
        )}
      >
        Skip to content
      </a>
      <div className="mx-auto flex min-h-(--header-height) max-w-content items-center gap-3 px-page-safe lg:gap-4 xl:gap-6">
        <Logo brand={site.brand} className="mr-auto lg:mr-0" />
        <PrimaryNav items={primaryNav(site.features)} className="hidden lg:mr-auto lg:block" />
        <OpenStatus hours={site.hours} className="hidden shrink-0 xl:inline-flex" />
        <ThemeToggle className="hidden shrink-0 lg:flex" />
        <a
          href={site.memberPortal.loginUrl}
          className="group hidden min-h-hit items-center gap-1 rounded-sm text-small font-medium whitespace-nowrap text-fg-muted transition-colors hover:text-fg lg:inline-flex"
        >
          Member login
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform duration-fast ease-out group-hover:translate-x-px group-hover:-translate-y-px motion-reduce:transition-none"
            strokeWidth={1.5}
          />
        </a>
        <NextLink href={BOOK_VISIT_HREF} className={cn(buttonClasses({ size: 'sm' }), 'shrink-0')}>
          Book a visit
        </NextLink>
      </div>
    </HeaderShell>
  );
}
