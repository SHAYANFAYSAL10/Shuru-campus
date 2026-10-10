'use client';

import { Check, Info } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import NextLink from 'next/link';
import { useState } from 'react';

import { type Plan, rateUnitLabel } from '@campus/contracts';

import { BeginLine } from '@/components/motion/begin-line';
import { buttonClasses } from '@/components/ui/button-classes';
import { Link } from '@/components/ui/link';
import { Price } from '@/components/ui/price';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/hooks/use-media-query';
import {
  answeredCount,
  completeAnswers,
  FINDER_QUESTIONS,
  type FinderAnswers,
  periodNote,
  recommendPlan,
  resolveRecommendation,
  type ResolvedRecommendation,
} from '@/lib/plan-finder';
import { bookHref, keyFeatures, planHref, rateTitle } from '@/lib/plans';
import { ease, seconds } from '@/styles/motion';
import { radius } from '@/styles/shape';

const RESULT_TITLE_ID = 'plan-finder-result';
const COMPARE_HREF = '/spaces';

export interface PlanFinderProps {
  plans: readonly Plan[];
  className?: string;
}

/**
 * The plan finder's questions and answer (Home #4). Three segmented controls (native radios, so
 * arrow keys move within a question and Tab between them); once all three are answered the card
 * beside them turns into the suggested plan, its price and a "Book" link that carries the plan
 * (and rate, when one fits) into the inquiry form. Changing an answer swaps the suggestion: the
 * card resizes with a `layout` animation (transform only) while its content crossfades, and the
 * begin line traces the new plan's name (04 §1). Reduced motion: a short crossfade, no glide.
 * A polite status line tells screen readers what's suggested.
 *
 * Without JS the questions render but can't answer; the card says so and links every plan.
 */
export function PlanFinder({ plans, className }: PlanFinderProps) {
  const [answers, setAnswers] = useState<Partial<FinderAnswers>>({});
  const reduced = useReducedMotion();

  const complete = completeAnswers(answers);
  const resolved = complete ? resolveRecommendation(recommendPlan(complete), plans) : undefined;
  const state = !complete ? 'pending' : resolved ? 'match' : 'none';
  const contentKey = resolved ? `${resolved.plan.slug}:${resolved.price.id}` : state;

  const fade = { duration: seconds(reduced ? 'crossfade' : 'base'), ease: ease.out };

  return (
    <div
      className={cn(
        'grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-gutter lg:gap-y-0',
        className,
      )}
    >
      <ol className="flex flex-col lg:col-span-7">
        {FINDER_QUESTIONS.map((question, index) => (
          <li key={question.id} className="border-t border-border py-6 first:border-t-0 first:pt-0">
            <SegmentedControl
              // The step number sits in the legend's line, not a column of its own, so the
              // answers get the full width and stay on one row at 320px.
              legend={
                <>
                  <span
                    aria-hidden="true"
                    className="mr-3 type-eyebrow text-fg-subtle tabular-nums"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {question.legend}
                </>
              }
              legendClassName="mb-3 type-h3 text-fg"
              name={`finder-${question.id}`}
              size="sm"
              options={question.options}
              value={answers[question.id]}
              onValueChange={(value) => {
                setAnswers((previous) => ({ ...previous, [question.id]: value }));
              }}
            />
          </li>
        ))}
      </ol>

      <m.section
        aria-labelledby={RESULT_TITLE_ID}
        layout
        transition={{ layout: { duration: seconds('slow'), ease: ease.out } }}
        style={{ borderRadius: radius.lg }}
        className="relative overflow-hidden border border-border bg-surface p-6 sm:p-8 lg:col-span-5"
      >
        <h3 id={RESULT_TITLE_ID} className="type-eyebrow text-fg-subtle">
          Your match
        </h3>

        <AnimatePresence mode="popLayout" initial={false}>
          <m.div
            key={contentKey}
            layout="position"
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              // Exits are quicker than entrances (04 §6).
              transition: { duration: seconds(reduced ? 'crossfade' : 'fast'), ease: ease.in },
            }}
            transition={fade}
            className="mt-4"
          >
            {resolved && complete ? (
              <MatchCard resolved={resolved} note={periodNote(resolved, complete.often)} />
            ) : state === 'none' ? (
              <NoMatch />
            ) : (
              <Pending answered={answeredCount(answers)} />
            )}
          </m.div>
        </AnimatePresence>

        <p role="status" className="sr-only">
          {resolved ? statusText(resolved) : ''}
        </p>
      </m.section>
    </div>
  );
}

/** What the status line says: "Suggested plan: Hot Desk, 100 taka per hour." */
function statusText({ plan, price, isFrom }: ResolvedRecommendation): string {
  const amount = price.amountBdt.toLocaleString('en-US');
  return `Suggested plan: ${plan.name}, ${isFrom ? 'from ' : ''}${amount} taka per ${rateUnitLabel(price)}.`;
}

function MatchCard({ resolved, note }: { resolved: ResolvedRecommendation; note?: string }) {
  const { plan, rate, price, isFrom } = resolved;
  const size = rate && (rate.label ?? rate.capacity) ? rateTitle(rate) : undefined;

  return (
    <div className="flex flex-col">
      <h4 className="type-h2 text-fg">{plan.name}</h4>
      <BeginLine draw="mount" className="mt-3 w-16" />
      <p className="mt-4 text-pretty text-fg-muted">{plan.summary}</p>

      <p className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-fg">
        {isFrom ? <span className="text-small text-fg-muted">From</span> : null}
        <Price amount={price.amountBdt} rate={price} size="lg" />
        {size ? (
          <span className="text-small text-fg-muted">
            {size.title}
            {size.note ? ` · ${size.note}` : null}
          </span>
        ) : null}
      </p>

      {note ? (
        <p className="mt-3 flex gap-2 text-small text-fg-muted">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
          {note}
        </p>
      ) : null}

      <ul aria-label="Includes" className="mt-6 flex flex-col gap-2 border-t border-border pt-5">
        {keyFeatures(plan).map((feature) => (
          <li key={feature.title} className="flex gap-2 text-small text-fg-muted">
            <Check
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-brand"
              strokeWidth={1.5}
            />
            <span>
              {feature.title}
              {feature.detail ? <span className="text-fg-subtle"> · {feature.detail}</span> : null}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <NextLink href={bookHref(plan.slug, rate?.id)} className={buttonClasses({ size: 'md' })}>
          Book {plan.name}
        </NextLink>
        <NextLink
          href={planHref(plan.slug)}
          // Starts with the visible text (WCAG 2.5.3), then names the plan.
          aria-label={`Plan details: ${plan.name}`}
          className={buttonClasses({ variant: 'secondary', size: 'md' })}
        >
          Plan details
        </NextLink>
      </div>
    </div>
  );
}

function Pending({ answered }: { answered: number }) {
  const total = FINDER_QUESTIONS.length;

  return (
    <div className="flex flex-col">
      <p className="type-h3 text-pretty text-fg">
        Answer all three and we’ll suggest the plan that fits.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <span aria-hidden="true" className="flex gap-1.5">
          {FINDER_QUESTIONS.map((question, index) => (
            <span
              key={question.id}
              className={cn(
                'h-1 w-8 rounded-full transition-colors duration-base ease-out',
                index < answered ? 'bg-accent' : 'bg-border-strong',
              )}
            />
          ))}
        </span>
        <span className="text-small text-fg-muted tabular-nums">
          {answered} of {total} answered
        </span>
      </div>

      <noscript>
        <p className="mt-6 text-small text-fg-muted">
          Suggestions need JavaScript. Every plan is side by side on Spaces &amp; pricing.
        </p>
      </noscript>

      <Link href={COMPARE_HREF} variant="standalone" className="mt-6 min-h-hit self-start">
        Or compare every plan
      </Link>
    </div>
  );
}

function NoMatch() {
  return (
    <div className="flex flex-col">
      <p className="type-h3 text-pretty text-fg">That one’s best talked through.</p>
      <p className="mt-3 text-pretty text-fg-muted">
        We can’t suggest a plan for those answers right now. Compare every plan, or tell us how you
        work.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <NextLink href={COMPARE_HREF} className={buttonClasses({ size: 'md' })}>
          Compare every plan
        </NextLink>
        <NextLink href="/contact" className={buttonClasses({ variant: 'secondary', size: 'md' })}>
          Send an inquiry
        </NextLink>
      </div>
    </div>
  );
}
