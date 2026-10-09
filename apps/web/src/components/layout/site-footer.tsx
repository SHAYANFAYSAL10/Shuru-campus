import { ArrowUpRight } from 'lucide-react';
import NextLink from 'next/link';

import { dhakaParts } from '@campus/contracts';

import { BeginLine } from '@/components/motion/begin-line';
import { CopyButton } from '@/components/ui/copy-button';
import { Link } from '@/components/ui/link';
import { OpenStatus } from '@/components/ui/open-status';
import { SOCIAL_LABEL, SocialIcon } from '@/components/ui/social-icon';
import { getSiteSettings } from '@/lib/api';
import { telHref } from '@/lib/contact';
import { hoursSummary } from '@/lib/hours-summary';
import { BOOK_VISIT_HREF, LEGAL_NAV, primaryNav } from '@/lib/navigation';

import type { ReactNode } from 'react';

const LINK = 'rounded-sm text-fg-muted transition-colors hover:text-fg';
const ARROW =
  'size-4 shrink-0 transition-transform duration-fast ease-out group-hover:translate-x-px group-hover:-translate-y-px motion-reduce:transition-none';

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="type-eyebrow text-fg-muted uppercase">{title}</h2>
      {children}
    </div>
  );
}

/** A link leaving the site, marked with the same arrow as the header's Member login. */
function OutboundLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className={`group inline-flex min-h-hit items-center gap-1 ${LINK}`}>
      {children}
      <ArrowUpRight aria-hidden="true" className={ARROW} strokeWidth={1.5} />
    </a>
  );
}

/**
 * The public site footer (docs/05-pages-and-interactions.md): the "Let's begin." sign-off, then
 * where to find us, how to reach us, opening hours and the site map, then copyright, legal
 * links and socials. Its nav is also the no-JS route around the site below `lg`, where the
 * header's menu needs JS. A Server Component; only the open status and copy button hydrate.
 */
export async function SiteFooter() {
  const site = await getSiteSettings();
  const { brand, contact, hours, socials } = site;
  const year = dhakaParts(new Date()).date.slice(0, 4);

  return (
    <footer className="border-t border-border bg-bg-alt pb-safe">
      <div className="@container mx-auto max-w-content pt-section px-page-safe">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="type-display text-fg">
            Let’s{' '}
            <span className="inline-flex flex-col">
              <em>begin.</em>
              {/* em-based: clears the descender of the display face at every fluid size. */}
              <BeginLine draw="inView" delay={200} className="mt-[0.14em]" />
            </span>
          </p>
          <Link
            href={BOOK_VISIT_HREF}
            variant="standalone"
            className="min-h-hit self-start lg:self-auto"
          >
            Book a visit
          </Link>
        </div>

        <div className="mt-16 grid gap-x-gutter gap-y-12 border-t border-border pt-12 @2xl:grid-cols-2 @5xl:grid-cols-4">
          <Column title="Visit">
            <address className="flex flex-col text-fg not-italic">
              {contact.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <div className="-my-3">
              <OutboundLink href={contact.mapUrl}>Open in Google Maps</OutboundLink>
            </div>
          </Column>

          <Column title="Get in touch">
            <ul className="-my-3 flex flex-col">
              {contact.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={telHref(phone)}
                    className={`inline-flex min-h-hit items-center tabular-nums ${LINK}`}
                  >
                    {phone}
                  </a>
                </li>
              ))}
              <li className="flex min-w-0 items-center gap-1">
                <a
                  href={`mailto:${contact.email}`}
                  className={`inline-flex min-h-hit min-w-0 items-center [overflow-wrap:anywhere] ${LINK}`}
                >
                  {contact.email}
                </a>
                <CopyButton
                  value={contact.email}
                  label="Copy email address"
                  copiedMessage="Email address copied"
                />
              </li>
            </ul>
          </Column>

          <Column title="Hours">
            <OpenStatus hours={hours} />
            {/* Days, then times, each in its own column so the times line up. */}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-fg">
              {hoursSummary(hours).map((row) => (
                <div key={row.days} className="contents">
                  <dt className="text-fg-muted">
                    <span aria-hidden="true">{row.days}</span>
                    <span className="sr-only">{row.daysLong}</span>
                  </dt>
                  <dd className="tabular-nums">{row.time ?? 'Closed'}</dd>
                </div>
              ))}
            </dl>
            <p className="text-small text-fg-muted">Dhaka time</p>
          </Column>

          <Column title="Explore">
            <nav aria-label="Footer" className="-my-3">
              <ul className="flex flex-col">
                <li>
                  <NextLink
                    href="/"
                    className={`inline-flex min-h-hit min-w-hit items-center ${LINK}`}
                  >
                    Home
                  </NextLink>
                </li>
                {primaryNav(site.features).map((item) => (
                  <li key={item.href}>
                    <NextLink
                      href={item.href}
                      className={`inline-flex min-h-hit items-center ${LINK}`}
                    >
                      {item.label}
                    </NextLink>
                  </li>
                ))}
                <li>
                  <OutboundLink href={site.memberPortal.loginUrl}>Member login</OutboundLink>
                </li>
              </ul>
            </nav>
          </Column>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border py-6 md:flex-row md:items-center md:gap-8">
          <p className="text-small text-fg-muted md:mr-auto">
            © {year} {brand.legalName}
          </p>
          <nav aria-label="Legal">
            <ul className="-mx-2 flex flex-wrap">
              {LEGAL_NAV.map((item) => (
                <li key={item.href}>
                  <NextLink
                    href={item.href}
                    className={`inline-flex min-h-hit items-center px-2 text-small ${LINK}`}
                  >
                    {item.label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </nav>
          {socials.length > 0 ? (
            <ul aria-label="Social media" className="-mx-3 flex">
              {socials.map(({ platform, url }) => (
                <li key={url}>
                  <a
                    href={url}
                    className={`inline-flex size-11 items-center justify-center ${LINK}`}
                  >
                    <SocialIcon platform={platform} />
                    <span className="sr-only">
                      {brand.shortName} on {SOCIAL_LABEL[platform]}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
