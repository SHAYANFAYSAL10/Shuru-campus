import { ArrowRight, ImageOff } from 'lucide-react';
import { notFound } from 'next/navigation';

import { plansSeed, siteSeed } from '@campus/contracts';

import { ColorSection } from '@/app/%5Fstyleguide/_components/color-section';
import { ChipDemo, SegmentedDemo } from '@/app/%5Fstyleguide/_components/control-demos';
import { FormDemo } from '@/app/%5Fstyleguide/_components/form-demo';
import { MotionDemos, MotionTokens } from '@/app/%5Fstyleguide/_components/motion-demos';
import { OverlayDemos } from '@/app/%5Fstyleguide/_components/overlay-demos';
import { SgGroup, SgSection, SgState } from '@/app/%5Fstyleguide/_components/sg-section';
import { ThemePair } from '@/app/%5Fstyleguide/_components/theme-pair';
import { Reveal } from '@/components/motion/reveal';
import { Badge } from '@/components/ui/badge';
import { Button, type ButtonVariant } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { OpenStatus } from '@/components/ui/open-status';
import { Price } from '@/components/ui/price';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/ui/theme-toggle';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Styleguide',
  description: 'Design tokens and every UI primitive, in every state, in both themes.',
  robots: { index: false, follow: false },
};

/** Dev-only: 404 in production builds unless ENABLE_STYLEGUIDE=true (e.g. for visual tests). */
function styleguideEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_STYLEGUIDE === 'true';
}

const NAV = [
  ['color', 'Color'],
  ['type', 'Type'],
  ['space', 'Space & shape'],
  ['motion', 'Motion'],
  ['actions', 'Actions'],
  ['forms', 'Forms'],
  ['overlays', 'Overlays'],
  ['feedback', 'Feedback & data'],
] as const;

const TYPE_ROLES = [
  ['type-display', 'Display · 48 → 128px · Fraunces', 'Where work begins'],
  ['type-h1', 'H1 · 40 → 80px · Fraunces', 'Your next chapter begins here'],
  ['type-h2', 'H2 · 32 → 56px · Fraunces', 'Calm over clever'],
  ['type-h3', 'H3 · 22 → 28px · Fraunces', 'Honest and specific'],
  [
    'type-lead',
    'Lead · 18 → 22px · Geist',
    'Motion and detail reward attention but never demand it.',
  ],
  [
    'text-body',
    'Body · 16 → 17px · Geist',
    'Real prices, real hours, a live “open now”. Tabular figures in prices, optical alignment, considered empty and error states, hover states with intent.',
  ],
  ['text-small', 'Small · 14px · Geist', 'Meta and captions'],
  ['type-eyebrow', 'Eyebrow · 12 → 13px · Geist Mono', '01 — Spaces'],
] as const;

const SPACING = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32] as const;
const RADII = [
  ['rounded-sm', 'sm · 6px', 'Inputs, chips'],
  ['rounded-md', 'md · 12px', 'Cards'],
  ['rounded-lg', 'lg · 24px', 'Media, panels'],
  ['rounded-full', 'full', 'Pills, avatars'],
] as const;

const VARIANTS: [ButtonVariant, string][] = [
  ['primary', 'Book a tour'],
  ['secondary', 'See pricing'],
  ['ghost', 'Cancel'],
  ['link', 'Clear filters'],
];

const STATES = [
  ['Rest', {}],
  ['Hover', { 'data-preview': 'hover' }],
  ['Focus', { 'data-preview': 'focus' }],
  ['Pressed', { 'data-preview': 'active' }],
  ['Disabled', { disabled: true }],
  ['Loading', { loading: true }],
] as const;

export default function StyleguidePage() {
  if (!styleguideEnabled()) notFound();

  const hotDesk = plansSeed.find((plan) => plan.slug === 'hot-desk');
  const seminar = plansSeed.find((plan) => plan.slug === 'seminar-room');
  const priceSamples = [hotDesk?.rates[0], hotDesk?.rates[1], seminar?.rates.at(-1)].filter(
    (rate) => rate !== undefined,
  );

  return (
    <div className="mx-auto max-w-content px-page pt-safe pb-24">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border py-12">
        <div>
          <p className="type-eyebrow text-fg-subtle">Design system</p>
          <h1 className="mt-3 type-h1 text-fg">Styleguide</h1>
          <p className="mt-4 max-w-prose type-lead text-fg-muted">
            Tokens and primitives in every state, light and dark side by side. Hover, focus and
            pressed states are frozen with{' '}
            <code className="font-mono text-small">data-preview</code> so they can be reviewed
            without interacting.
          </p>
        </div>
        <ThemeToggle iconOnly={false} />
      </header>

      <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-12">
        {/* Sidebar column width: fits the longest section name. */}
        <nav aria-label="Styleguide sections" className="hidden lg:block">
          <ol className="sticky top-8 flex flex-col gap-1 py-12">
            {NAV.map(([id, label], index) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex gap-3 rounded-sm py-1.5 text-small text-fg-muted transition-colors hover:text-fg"
                >
                  <span className="font-mono text-fg-subtle tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main className="min-w-0 pt-12">
          <SgSection
            id="color"
            number="01"
            title="Color"
            intro="Paper and ink carry the page. Lake is the calm secondary, and marigold is the one accent, kept to a single moment per screen."
          >
            <ColorSection />
          </SgSection>

          <SgSection
            id="type"
            number="02"
            title="Type"
            intro="Fraunces for headlines, pull quotes and big numbers only. Geist for everything else. Sizes are fluid between 360 and 1440px."
          >
            <ThemePair>
              <ul className="flex flex-col gap-8">
                {TYPE_ROLES.map(([role, meta, sample]) => (
                  <li key={role} className="flex min-w-0 flex-col gap-2">
                    <span className="font-mono text-small text-fg-subtle">
                      {role} · {meta}
                    </span>
                    <span className={`${role} max-w-prose break-words text-fg`}>{sample}</span>
                  </li>
                ))}
                <li className="flex flex-col gap-2">
                  <span className="font-mono text-small text-fg-subtle">
                    Italic emphasis, one word per headline
                  </span>
                  <span className="type-h2 text-fg">
                    Your startup <em>begins</em> here
                  </span>
                </li>
              </ul>
            </ThemePair>
          </SgSection>

          <SgSection
            id="space"
            number="03"
            title="Space & shape"
            intro="A 4px base scale, fluid section padding, and borders over shadows."
          >
            <SgGroup title="Spacing scale">
              <ul className="flex flex-col gap-2">
                {SPACING.map((step) => (
                  <li key={step} className="flex items-center gap-4 text-small">
                    <code className="w-10 font-mono text-fg-subtle">{step}</code>
                    {/* Width is the spacing step itself, which is what this row documents. */}
                    <span
                      aria-hidden="true"
                      className="h-3 rounded-sm bg-brand"
                      style={{ width: `calc(var(--spacing) * ${String(step)})` }}
                    />
                    <span className="font-mono text-fg-muted">{step * 4}px</span>
                  </li>
                ))}
              </ul>
            </SgGroup>
            <ThemePair>
              <div className="flex flex-col gap-8">
                <ul className="flex flex-wrap gap-6">
                  {RADII.map(([cls, label, use]) => (
                    <li key={cls} className="flex flex-col gap-2">
                      <span className={`${cls} size-20 border border-border-strong bg-surface`} />
                      <span className="text-small">
                        <span className="block font-mono text-fg">{label}</span>
                        <span className="block text-fg-muted">{use}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-wrap gap-6">
                  {(['shadow-raise', 'shadow-overlay'] as const).map((shadow) => (
                    <li key={shadow} className="flex flex-col gap-2">
                      <span className={`${shadow} size-24 rounded-md bg-surface`} />
                      <code className="font-mono text-small text-fg">{shadow}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </ThemePair>
          </SgSection>

          <SgSection
            id="motion"
            number="04"
            title="Motion"
            intro="Motion explains where things come from and what changed. Only transform and opacity animate, and everything has a reduced-motion version."
          >
            <MotionTokens />
            <MotionDemos marqueeItems={plansSeed.map((plan) => plan.name)} />
          </SgSection>

          <SgSection id="actions" number="05" title="Actions">
            <Reveal>
              <SgGroup
                title="Buttons"
                note="Hover lifts the primary 1px and darkens it 6%. Pressed scales to 98%. Loading keeps the width and the focus."
              >
                <ThemePair>
                  <div className="flex flex-col gap-8">
                    {VARIANTS.map(([variant, label]) => (
                      <div key={variant} className="flex flex-col gap-3">
                        <span className="font-mono text-small text-fg-subtle">{variant}</span>
                        <div className="flex flex-wrap gap-x-5 gap-y-4">
                          {STATES.map(([state, props]) => (
                            <SgState key={state} label={state}>
                              <Button variant={variant} {...props}>
                                {label}
                              </Button>
                            </SgState>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-col gap-3">
                      <span className="font-mono text-small text-fg-subtle">sizes</span>
                      <div className="flex flex-wrap items-end gap-4">
                        <SgState label="sm · 36px">
                          <Button size="sm">Book</Button>
                        </SgState>
                        <SgState label="md · 44px">
                          <Button>Book a tour</Button>
                        </SgState>
                        <SgState label="lg · 52px">
                          <Button size="lg">
                            Book a tour
                            <ArrowRight aria-hidden="true" className="size-5" strokeWidth={1.5} />
                          </Button>
                        </SgState>
                      </div>
                    </div>
                  </div>
                </ThemePair>
              </SgGroup>
            </Reveal>

            <Reveal>
              <SgGroup title="Links, badges and chips">
                <ThemePair>
                  <div className="flex flex-col gap-8">
                    <p className="max-w-prose text-body text-fg">
                      Inline links like <Link href="/spaces">our spaces</Link> stay underlined, so
                      they never depend on color alone, and{' '}
                      <Link href="https://maps.google.com" external>
                        external ones
                      </Link>{' '}
                      say they open a new tab.
                    </p>
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                      <SgState label="Standalone">
                        <Link href="/spaces/hot-desk" variant="standalone">
                          See Hot Desk pricing
                        </Link>
                      </SgState>
                      <SgState label="Hover">
                        <Link href="/spaces/hot-desk" variant="standalone" data-preview="hover">
                          See Hot Desk pricing
                        </Link>
                      </SgState>
                      <SgState label="Focus">
                        <Link href="/spaces/hot-desk" variant="standalone" data-preview="focus">
                          See Hot Desk pricing
                        </Link>
                      </SgState>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Badge>Neutral</Badge>
                      <Badge tone="accent">Popular</Badge>
                      <Badge tone="info">Preview mode</Badge>
                    </div>
                    <ChipDemo />
                  </div>
                </ThemePair>
              </SgGroup>
            </Reveal>
          </SgSection>

          <SgSection
            id="forms"
            number="06"
            title="Forms"
            intro="Native controls, styled. Labels above, hints before the control, errors after it with an icon."
          >
            <Reveal>
              <ThemePair className="@container">
                <div className="grid gap-6 @2xl:grid-cols-2">
                  <Field label="Name">
                    <Input placeholder="Your full name" />
                  </Field>
                  <Field label="Email" hint="We'll only use it to reply.">
                    <Input type="email" defaultValue="rahim@example.com" />
                  </Field>
                  <Field label="Phone" error="Use digits, spaces, + or - only.">
                    <Input type="tel" defaultValue="01700-76608a" />
                  </Field>
                  <Field label="Team size" optional>
                    <Input data-preview="focus" inputMode="numeric" defaultValue="4" />
                  </Field>
                  <Field label="Company" optional>
                    <Input disabled defaultValue="Disabled" />
                  </Field>
                  <Field label="Space" optional>
                    <Select defaultValue="business-seating">
                      {plansSeed.map((plan) => (
                        <option key={plan.slug} value={plan.slug}>
                          {plan.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    label="Message"
                    error="Message needs at least 10 characters."
                    className="@2xl:col-span-2"
                  >
                    <Textarea defaultValue="Hello" />
                  </Field>
                </div>
                <div className="mt-8 grid gap-x-8 gap-y-2 @2xl:grid-cols-2">
                  <Checkbox label="Unchecked" />
                  <Checkbox label="Checked" defaultChecked />
                  <Checkbox label="With an error" error="Please confirm to continue." />
                  <Checkbox label="Disabled" disabled />
                  <Switch label="Inquiry form" hint="Show the contact form on the site." />
                  <Switch label="Gallery" defaultChecked />
                  <Switch label="Maintenance mode" disabled />
                </div>
                <div className="mt-8">
                  <SegmentedDemo />
                </div>
              </ThemePair>
            </Reveal>
            <Reveal>
              <SgGroup
                title="Live validation"
                note="The real inquiry contract. Submit it empty and focus moves to the first error; fix a field and its error clears as you type."
              >
                <FormDemo />
              </SgGroup>
            </Reveal>
          </SgSection>

          <SgSection
            id="overlays"
            number="07"
            title="Overlays"
            intro="Focus moves in, stays in and comes back. Esc always closes. Toasts pause while hovered or focused, and F8 jumps to them."
          >
            <Reveal>
              <OverlayDemos />
            </Reveal>
          </SgSection>

          <SgSection id="feedback" number="08" title="Feedback & data">
            <Reveal>
              <ThemePair>
                <div className="flex flex-col gap-10">
                  <SgGroup title="Prices" note="Tabular figures, so digits never shift.">
                    <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
                      {priceSamples.map((rate) => (
                        <Price key={rate.id} amount={rate.amountBdt} rate={rate} size="lg" />
                      ))}
                    </div>
                  </SgGroup>
                  <SgGroup title="Open status" note="Live, in Dhaka time.">
                    <OpenStatus hours={siteSeed.hours} />
                  </SgGroup>
                  <SgGroup title="Loading" note="Skeletons shaped like what's coming.">
                    <div
                      aria-busy="true"
                      className="flex max-w-sm flex-col gap-4 rounded-md border border-border bg-surface p-5"
                    >
                      <span className="sr-only">Loading plan</span>
                      <Skeleton className="aspect-4/5 w-full rounded-md" />
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex items-center justify-between pt-2">
                        <Skeleton className="h-8 w-28" />
                        <Skeleton className="h-11 w-32 rounded-full" />
                      </div>
                    </div>
                  </SgGroup>
                  <SgGroup
                    title="Empty"
                    note="A line illustration, one helpful sentence, one action."
                  >
                    <div className="flex max-w-sm flex-col items-center gap-4 rounded-md border border-dashed border-border-strong p-8 text-center">
                      <ImageOff
                        aria-hidden="true"
                        className="size-8 text-fg-subtle"
                        strokeWidth={1.5}
                      />
                      <p className="text-body text-fg-muted">
                        Nothing in <em>Events</em> yet. Try <em>Workspace</em>.
                      </p>
                      <Button variant="secondary" size="sm">
                        Show workspace
                      </Button>
                    </div>
                  </SgGroup>
                </div>
              </ThemePair>
            </Reveal>
          </SgSection>
        </main>
      </div>
    </div>
  );
}
