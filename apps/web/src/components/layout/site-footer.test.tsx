import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { siteSeed, type SiteSettings } from '@campus/contracts';

import { SiteFooter } from '@/components/layout/site-footer';

const site = vi.hoisted(() => ({ current: null as SiteSettings | null }));
vi.mock('@/lib/api', () => ({
  getSiteSettings: () => Promise.resolve(site.current),
}));

async function renderFooter(settings: SiteSettings = siteSeed) {
  site.current = settings;
  render(await SiteFooter());
}

describe('SiteFooter', () => {
  it('signs off and offers a visit', async () => {
    await renderFooter();

    expect(screen.getByText(/Let’s/)).toHaveTextContent('Let’s begin.');
    expect(screen.getByRole('link', { name: 'Book a visit' })).toHaveAttribute('href', '/contact');
  });

  it('lists the address, dialable phones and the email', async () => {
    await renderFooter();

    for (const line of siteSeed.contact.addressLines) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: '+88 09666-731731' })).toHaveAttribute(
      'href',
      'tel:+8809666731731',
    );
    expect(screen.getByRole('link', { name: siteSeed.contact.email })).toHaveAttribute(
      'href',
      `mailto:${siteSeed.contact.email}`,
    );
    expect(screen.getByRole('button', { name: 'Copy email address' })).toBeInTheDocument();
  });

  it('summarises the hours, with full day names for screen readers', async () => {
    await renderFooter();

    const terms = screen.getAllByRole('term').map((term) => term.textContent);
    const times = screen.getAllByRole('definition').map((time) => time.textContent);
    expect(terms).toEqual(['Sat–ThuSaturday to Thursday', 'FriFriday']);
    expect(times).toEqual(['9:00–19:00', 'Closed']);
    expect(screen.getByText('Saturday to Thursday')).toHaveClass('sr-only');
  });

  it('links every page, without the gallery when it is switched off', async () => {
    await renderFooter({ ...siteSeed, features: { ...siteSeed.features, gallery: false } });

    const nav = within(screen.getByRole('navigation', { name: 'Footer' }));
    expect(nav.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Home',
      'Spaces',
      'About',
      'Contact',
      'Member login',
    ]);
  });

  it('shows the copyright, legal links and named social links', async () => {
    await renderFooter();

    expect(screen.getByText(/^© \d{4} /)).toHaveTextContent(siteSeed.brand.legalName);
    const legal = within(screen.getByRole('navigation', { name: 'Legal' }));
    expect(legal.getAllByRole('link')).toHaveLength(3);
    const social = within(screen.getByRole('list', { name: 'Social media' }));
    expect(
      social.getByRole('link', { name: `${siteSeed.brand.shortName} on Instagram` }),
    ).toHaveAttribute('href', siteSeed.socials[1]?.url);
  });

  it('leaves out the social list when there are no socials', async () => {
    await renderFooter({ ...siteSeed, socials: [] });
    expect(screen.queryByRole('list', { name: 'Social media' })).not.toBeInTheDocument();
  });
});
