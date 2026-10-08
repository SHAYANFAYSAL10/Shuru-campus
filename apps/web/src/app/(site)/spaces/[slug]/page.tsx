import { notFound } from 'next/navigation';

import { PLAN_SLUGS, PlanSlug } from '@campus/contracts';

import { JsonLd } from '@/components/seo/json-ld';
import { PlanSection } from '@/components/spaces/plan-section';
import { RelatedPlans } from '@/components/spaces/related-plans';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { getBrand, getPlan, getPlans } from '@/lib/api';
import { breadcrumbJsonLd, type Crumb } from '@/lib/breadcrumbs';
import { pageMetadata } from '@/lib/metadata';
import { planDescription, planHref, relatedPlans } from '@/lib/plans';

import type { Metadata } from 'next';

const SPACES: Crumb = { name: 'Spaces & pricing', path: '/spaces' };

/** Every plan's page, built ahead. If the API is down at build, the known slugs stand in. */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const plans = await getPlans();
  const slugs = plans.ok ? plans.data.map((plan) => plan.slug) : PLAN_SLUGS;
  return slugs.map((slug) => ({ slug }));
}

/**
 * The plan for a route's slug. An unknown slug, or one the API doesn't have, is a 404; any other
 * failure throws to the error boundary (which offers a retry) rather than showing a page with no
 * plan on it.
 */
async function loadPlan(param: string) {
  const slug = PlanSlug.safeParse(param);
  if (!slug.success) notFound();
  const plan = await getPlan(slug.data);
  if (plan.ok) return plan.data;
  if (plan.error.kind === 'http' && plan.error.status === 404) notFound();
  throw new Error(`Plan ${slug.data} failed to load (${plan.error.kind}).`);
}

export async function generateMetadata({ params }: PageProps<'/spaces/[slug]'>): Promise<Metadata> {
  const [brand, plan] = await Promise.all([getBrand(), params.then(({ slug }) => loadPlan(slug))]);
  return pageMetadata(brand, {
    title: plan.name,
    description: planDescription(plan),
    path: planHref(plan.slug),
  });
}

/**
 * A plan's own page (docs/05-pages-and-interactions.md → `/spaces/[slug]`): the same content as
 * its section on Spaces, deep-linkable for search and sharing, with the plans nearest it below.
 */
export default async function PlanPage({ params }: PageProps<'/spaces/[slug]'>) {
  const { slug } = await params;
  const [plan, plans] = await Promise.all([loadPlan(slug), getPlans()]);
  const trail: Crumb[] = [SPACES, { name: plan.name, path: planHref(plan.slug) }];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <div className="mx-auto max-w-content pt-8 px-page-safe pb-section sm:pt-12 lg:pt-16">
        <Breadcrumbs trail={trail} />
        <PlanSection
          plan={plan}
          index={0}
          eager
          headingLevel="h1"
          className="border-t-0 pt-8 pb-0 lg:pt-12 lg:pb-0"
        />
      </div>
      <RelatedPlans plans={plans.ok ? relatedPlans(plan, plans.data) : []} />
    </>
  );
}
