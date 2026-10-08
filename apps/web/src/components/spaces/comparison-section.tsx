import { Check } from 'lucide-react';

import { type Plan, type PlanFeature } from '@campus/contracts';

import { SectionHeading } from '@/components/sections/section-heading';
import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/ui/price';
import { cn } from '@/lib/cn';
import { listText } from '@/lib/list-text';
import { periodInfo, planPeriods } from '@/lib/periods';
import { comparePlans, featureList, type ComparisonRow } from '@/lib/plan-comparison';
import { planFromRate } from '@/lib/plans';

export interface ComparisonSectionProps {
  /** In display order. */
  plans: readonly Plan[];
}

const TITLE_ID = 'compare-title';

function billing(plan: Plan): string {
  const [first = '', ...rest] = planPeriods(plan).map((period) => periodInfo(period).label);
  return listText([first, ...rest.map((label) => label.toLowerCase())]);
}

function Features({ row, features }: { row: ComparisonRow; features: readonly PlanFeature[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {features.map((feature) => (
        <li key={feature.title} className="flex gap-2">
          <Check
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-brand"
            strokeWidth={1.5}
          />
          <span>
            {/* A feature's own row is already named after it, so the cell just ticks. */}
            {row.kind === 'feature' ? 'Included' : feature.title}
            {feature.detail ? <span className="text-fg-muted"> · {feature.detail}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function NotIncluded() {
  return (
    <>
      <span aria-hidden="true" className="text-fg-subtle">
        —
      </span>
      <span className="sr-only">Not included</span>
    </>
  );
}

const CELL = 'border-b border-border px-4 py-4 align-top';
const ROW_HEADER = cn(CELL, 'text-start font-medium text-fg');

/**
 * Spaces → comparison (05): every plan, side by side. From `lg` a features × plans table whose
 * header sticks under the site header (`--sticky-top`); it fits the page, so it never scrolls
 * sideways and the row headers need no sticking. Below `lg`, one card per plan listing what it
 * includes. What every plan includes is said once, in the lead, rather than as a row of ticks.
 */
export function ComparisonSection({ plans }: ComparisonSectionProps) {
  const { rows, shared } = comparePlans(plans);

  return (
    <section aria-labelledby={TITLE_ID} className="bg-bg-alt">
      <div className="mx-auto max-w-content py-section px-page-safe">
        <SectionHeading
          id={TITLE_ID}
          eyebrow="Compare"
          title={
            <>
              Every plan, side by <em>side</em>.
            </>
          }
          lead={
            shared.length > 0
              ? `Every plan includes ${featureList(shared)}. Here’s how the rest compares.`
              : 'Here’s what each plan includes, and how they’re billed.'
          }
        />

        <table className="mt-10 w-full table-fixed border-separate border-spacing-0 rounded-lg border border-border bg-surface text-small max-lg:hidden lg:mt-14">
          <caption className="sr-only">
            Plans compared by price, billing and what’s included
          </caption>
          <colgroup>
            <col className="w-1/6" />
            {plans.map((plan) => (
              <col key={plan.slug} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky top-(--sticky-top) z-raised rounded-tl-lg border-b border-border-strong bg-surface px-4 py-4 text-start align-bottom"
              >
                <span className="sr-only">Plan</span>
              </th>
              {plans.map((plan, i) => (
                <th
                  key={plan.slug}
                  scope="col"
                  className={cn(
                    'sticky top-(--sticky-top) z-raised border-b border-border-strong bg-surface px-4 py-4 text-start align-bottom',
                    i === plans.length - 1 && 'rounded-tr-lg',
                  )}
                >
                  {plan.highlight ? (
                    <Badge tone="accent" className="mb-2">
                      Popular
                    </Badge>
                  ) : null}
                  <a
                    href={`#${plan.slug}`}
                    className="block rounded-sm text-body font-medium text-fg transition-colors hover:text-accent-text"
                  >
                    {plan.name}
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className={ROW_HEADER}>
                From
              </th>
              {plans.map((plan) => {
                const from = planFromRate(plan);
                return (
                  <td key={plan.slug} className={cn(CELL, 'text-fg')}>
                    <Price amount={from.amountBdt} rate={from} size="sm" className="font-medium" />
                  </td>
                );
              })}
            </tr>
            <tr>
              <th scope="row" className={ROW_HEADER}>
                Billing
              </th>
              {plans.map((plan) => (
                <td key={plan.slug} className={cn(CELL, 'text-fg')}>
                  {billing(plan)}
                </td>
              ))}
            </tr>
            {rows.map((row, r) => {
              const last = r === rows.length - 1;
              return (
                <tr key={row.id}>
                  <th scope="row" className={cn(ROW_HEADER, last && 'rounded-bl-lg border-b-0')}>
                    {row.label}
                  </th>
                  {row.cells.map((cell, c) => (
                    <td
                      key={plans[c]?.slug ?? c}
                      className={cn(
                        CELL,
                        'text-fg',
                        last && 'border-b-0',
                        last && c === row.cells.length - 1 && 'rounded-br-lg',
                      )}
                    >
                      {cell ? <Features row={row} features={cell} /> : <NotIncluded />}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        <ul aria-label="Plans compared" className="mt-10 grid gap-4 sm:grid-cols-2 lg:hidden">
          {plans.map((plan, column) => {
            const from = planFromRate(plan);
            const included = rows.flatMap((row) => {
              const cell = row.cells[column];
              return cell ? [{ row, cell }] : [];
            });
            return (
              <li key={plan.slug} className="rounded-md border border-border bg-surface p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="type-h3 text-fg">
                    <a href={`#${plan.slug}`} className="rounded-sm">
                      {plan.name}
                    </a>
                  </h3>
                  {plan.highlight ? <Badge tone="accent">Popular</Badge> : null}
                </div>
                <dl className="mt-4 grid gap-4 text-small">
                  <div className="grid gap-1">
                    <dt className="text-fg-muted">From</dt>
                    <dd className="text-fg">
                      <Price
                        amount={from.amountBdt}
                        rate={from}
                        size="sm"
                        className="font-medium"
                      />
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="text-fg-muted">Billing</dt>
                    <dd className="text-fg">{billing(plan)}</dd>
                  </div>
                  {included.map(({ row, cell }) => (
                    <div key={row.id} className="grid gap-1 border-t border-border pt-4">
                      <dt className="text-fg-muted">{row.label}</dt>
                      <dd className="text-fg">
                        <Features row={row} features={cell} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
