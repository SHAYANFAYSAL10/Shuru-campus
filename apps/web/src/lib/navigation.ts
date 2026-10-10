import { type FeatureFlags } from '@campus/contracts';

import { LEGAL_DOCS, legalHref } from '@/lib/legal';

export interface NavItem {
  href: string;
  label: string;
}

/** Primary navigation (docs/05-pages-and-interactions.md). Home is the logo. */
const PRIMARY_NAV = [
  { href: '/spaces', label: 'Spaces' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery', flag: 'gallery' },
  { href: '/contact', label: 'Contact' },
] as const satisfies readonly (NavItem & { flag?: keyof FeatureFlags })[];

/** The primary nav, without pages switched off by feature flags. Shared by header, menu and footer. */
export function primaryNav(features: Pick<FeatureFlags, 'gallery'>): NavItem[] {
  return PRIMARY_NAV.filter((item) => !('flag' in item) || features[item.flag]).map(
    ({ href, label }) => ({ href, label }),
  );
}

/** Where the primary call to action ("Book a visit") leads. */
export const BOOK_VISIT_HREF = '/contact';

/**
 * Where "Member login" leads. The member portal isn't built yet, so this is an internal path with
 * no route: it lands on the site's own 404 instead of an external site that isn't ready.
 * TODO(client): point it back at `site.memberPortal.loginUrl` once the portal is live.
 */
export const MEMBER_LOGIN_HREF = '/members/login';

/**
 * How `href` relates to the current path, as an `aria-current` value: `page` on the page
 * itself, `true` inside its section (`/spaces/hot-desk` under Spaces), otherwise nothing.
 */
export function navCurrent(pathname: string, href: string): 'page' | 'true' | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (path === href) return 'page';
  if (href !== '/' && path.startsWith(`${href}/`)) return 'true';
  return undefined;
}

/** Id of the page's `<main>`: the skip link's target, and where focus goes when the bar it follows closes. */
export const MAIN_CONTENT_ID = 'main';

/** Legal pages (docs/05-pages-and-interactions.md → Legal), linked from the footer. */
export const LEGAL_NAV: readonly NavItem[] = LEGAL_DOCS.map(({ slug, navLabel }) => ({
  href: legalHref(slug),
  label: navLabel,
}));
