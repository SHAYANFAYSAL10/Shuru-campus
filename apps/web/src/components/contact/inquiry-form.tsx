'use client';

import { CircleAlert } from 'lucide-react';
import NextLink from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';

import { type Contact } from '@campus/contracts';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { telHref } from '@/lib/contact';
import { useZodForm } from '@/lib/forms/use-zod-form';
import { useHydrated } from '@/lib/hooks/use-hydrated';
import {
  firstInvalidField,
  INQUIRY_FIELDS,
  InquiryForm as InquiryFormSchema,
  type FieldErrors,
  type InquiryField,
  type InquiryFormState,
  type InquiryFormValues,
  type InterestGroup,
} from '@/lib/inquiry-form';

export interface InquiryFormProps {
  /** The no-JS path: the form posts here (a server action) and the page renders the result. */
  action: (data: FormData) => void;
  /** The JS path: called with the form's data once the fields pass in the browser. */
  onSend: (data: FormData) => void;
  sending: boolean;
  /** The id of the heading that names the form. */
  labelledBy: string;
  /** The last outcome (`idle`, `invalid` or `error`): errors to show and values to keep. */
  state: Exclude<InquiryFormState, { status: 'success' }>;
  /** Values to start from (the interest from a "Book this" link). */
  initialValues: InquiryFormValues;
  /** Plans and rates for the interest select. Empty when plans didn't load: the field steps aside. */
  groups: readonly InterestGroup[];
  /** The preferred date's range, ISO, Dhaka time. */
  dateRange: { min: string; max: string };
  contact: Pick<Contact, 'phones' | 'email'>;
}

const BANNER_ID = 'inquiry-error';

function Legend({ children }: { children: ReactNode }) {
  return <legend className="mb-6 type-eyebrow text-fg-subtle">{children}</legend>;
}

/**
 * The inquiry form (docs/05-pages-and-interactions.md → Contact). React Hook Form checks it with
 * the contract's rules on blur and submit and moves focus to the first error. It's a plain form
 * underneath, posting to a server action, so it works the same without JS: the server checks it
 * again and the page comes back with the errors marked, the first one focused (`autofocus`) and
 * everything typed still there.
 */
export function InquiryForm({
  action,
  onSend,
  sending,
  labelledBy,
  state,
  initialValues,
  groups,
  dateRange,
  contact,
}: InquiryFormProps) {
  const hydrated = useHydrated();
  const values = state.status === 'idle' ? initialValues : state.values;
  const serverErrors: FieldErrors = state.status === 'invalid' ? state.fieldErrors : {};
  const firstServerError = firstInvalidField(serverErrors);
  const bannerRef = useRef<HTMLDivElement>(null);

  const form = useZodForm(InquiryFormSchema, { defaultValues: values });
  const { errors } = form.formState;
  const { setError } = form;

  // Errors found on the server land on their fields (focusing the first); a failed send focuses
  // the banner, which says what happened and how else to reach us.
  useEffect(() => {
    if (state.status === 'error') {
      bannerRef.current?.focus();
      return;
    }
    if (state.status !== 'invalid') return;
    const first = firstInvalidField(state.fieldErrors);
    for (const field of INQUIRY_FIELDS) {
      const message = state.fieldErrors[field];
      if (message) setError(field, { type: 'server', message }, { shouldFocus: field === first });
    }
  }, [state, setError]);

  // Before hydration (and with no JS at all) the server's errors show; after, the form's own.
  const errorFor = (field: InquiryField) =>
    hydrated ? errors[field]?.message : serverErrors[field];
  // Without JS, focus can only move with the page load: `autofocus` on the first error.
  const autoFocus = (field: InquiryField) => !hydrated && firstServerError === field;
  const register = (field: InquiryField) => ({
    ...form.register(field),
    defaultValue: values[field],
    autoFocus: autoFocus(field),
  });

  const phone = contact.phones[0];

  return (
    <form
      action={action}
      noValidate
      aria-labelledby={labelledBy}
      onSubmit={(event) => {
        event.preventDefault();
        if (sending) return;
        const element = event.currentTarget;
        void form.handleSubmit(() => {
          onSend(new FormData(element));
        })(event);
      }}
      className="@container flex flex-col gap-10"
    >
      <fieldset className="min-w-0">
        <Legend>About you</Legend>
        <div className="grid gap-6 @lg:grid-cols-2">
          <Field label="Name" error={errorFor('name')} className="@lg:col-span-2">
            <Input autoComplete="name" required {...register('name')} />
          </Field>
          <Field label="Email" error={errorFor('email')}>
            <Input
              type="email"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              required
              {...register('email')}
            />
          </Field>
          {/* No hint here: it would push this input below Email's, its row partner. */}
          <Field label="Phone" optional error={errorFor('phone')}>
            <Input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="01700-766084"
              {...register('phone')}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <Legend>What you need</Legend>
        <div className="grid gap-6 @lg:grid-cols-2">
          {groups.length > 0 ? (
            <Field label="Space" optional error={errorFor('interest')} className="@lg:col-span-2">
              <Select {...register('interest')}>
                <option value="">Not sure yet</option>
                {groups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="Preferred start date" optional error={errorFor('preferredDate')}>
            <Input
              type="date"
              min={dateRange.min}
              max={dateRange.max}
              {...register('preferredDate')}
            />
          </Field>
          <Field label="How many people?" optional error={errorFor('teamSize')}>
            <Input inputMode="numeric" autoComplete="off" {...register('teamSize')} />
          </Field>
          <Field
            label="Message"
            hint="How you work, what you’d like to see, any questions."
            error={errorFor('message')}
            className="@lg:col-span-2"
          >
            <Textarea required {...register('message')} />
          </Field>
        </div>
      </fieldset>

      {/* Honeypot: hidden from people and assistive tech; bots that fill it are quietly dropped. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="inquiry-website">Website (leave this empty)</label>
        <input
          id="inquiry-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...form.register('website')}
          defaultValue=""
        />
      </div>

      <div className="flex flex-col gap-6">
        {state.status === 'error' ? (
          <div
            ref={bannerRef}
            id={BANNER_ID}
            tabIndex={-1}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- the no-JS path: focus the failure
            autoFocus={!hydrated}
            className="flex items-start gap-3 rounded-md border border-l-3 border-border border-l-danger bg-surface p-4"
          >
            <CircleAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-danger"
              strokeWidth={1.5}
            />
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-medium text-fg">{state.message}</p>
              <p className="text-small text-fg-muted">
                Everything you typed is still here.
                {phone ? (
                  <>
                    {' '}
                    Call{' '}
                    <a
                      href={telHref(phone)}
                      className="rounded-sm text-accent-text tabular-nums underline decoration-1 underline-offset-3 hover:decoration-2"
                    >
                      {phone}
                    </a>{' '}
                    or email{' '}
                  </>
                ) : (
                  ' Email '
                )}
                <a
                  href={`mailto:${contact.email}`}
                  className="rounded-sm [overflow-wrap:anywhere] text-accent-text underline decoration-1 underline-offset-3 hover:decoration-2"
                >
                  {contact.email}
                </a>
                .
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 @lg:flex-row @lg:items-center @lg:gap-6">
          <Button
            type="submit"
            size="lg"
            loading={sending}
            loadingLabel="Sending inquiry"
            className="w-full @lg:w-auto"
          >
            {state.status === 'error' ? 'Try again' : 'Send inquiry'}
          </Button>
          <p className="text-small text-fg-muted">
            We only use these details to reply.{' '}
            <NextLink
              href="/legal/privacy"
              className="rounded-sm text-accent-text underline decoration-1 underline-offset-3 hover:decoration-2"
            >
              Privacy policy
            </NextLink>
          </p>
        </div>
      </div>
    </form>
  );
}
