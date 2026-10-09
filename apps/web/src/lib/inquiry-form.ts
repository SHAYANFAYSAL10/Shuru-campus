import { z } from 'zod';

import { formatBdt, InquiryCreate, rateUnitLabel, type Plan } from '@campus/contracts';

import { type ApiFailure } from '@/lib/api/result';
import { rateTitle, sortPlans } from '@/lib/plans';

/*
 * The contact page's inquiry form (docs/05-pages-and-interactions.md → Contact). It sends
 * `InquiryCreate`, with one difference: the plan and the rate are a single choice, "interest"
 * (`meeting-room` or `meeting-room:big`), so one native <select> covers both, works without JS
 * and can never pair a plan with another plan's rate.
 */

const INTEREST_SEPARATOR = ':';

/** The form's fields, in the order they appear (focus goes to the first invalid one). */
export const INQUIRY_FIELDS = [
  'name',
  'email',
  'phone',
  'interest',
  'preferredDate',
  'teamSize',
  'message',
  'website',
] as const;

export type InquiryField = (typeof INQUIRY_FIELDS)[number];

/** What the form holds. Validated with the contract's own rules, field by field. */
export const InquiryForm = InquiryCreate.omit({ planSlug: true, rateId: true }).extend({
  interest: z.string().max(100).optional(),
});
export type InquiryFormInput = z.input<typeof InquiryForm>;

/** Raw form values, as typed (and as echoed back to a page rendered without JS). */
export type InquiryFormValues = Record<InquiryField, string>;

export const EMPTY_FORM_VALUES: InquiryFormValues = {
  name: '',
  email: '',
  phone: '',
  interest: '',
  preferredDate: '',
  teamSize: '',
  message: '',
  website: '',
};

export function interestValue(planSlug: string, rateId?: string): string {
  return rateId ? `${planSlug}${INTEREST_SEPARATOR}${rateId}` : planSlug;
}

/** The plan and rate behind an interest value. Empty means "not sure yet". */
export function parseInterest(value: string | undefined): { planSlug?: string; rateId?: string } {
  const [planSlug = '', rateId = ''] = (value ?? '').trim().split(INTEREST_SEPARATOR, 2);
  return {
    ...(planSlug ? { planSlug } : {}),
    ...(rateId ? { rateId } : {}),
  };
}

export interface InterestOption {
  value: string;
  label: string;
}

export interface InterestGroup {
  /** The plan's name, as the <optgroup> label. */
  label: string;
  options: InterestOption[];
}

/**
 * The interest choices: per plan (in display order), "any option" and then each rate with its
 * price. Every label names the plan, since a closed select shows the option alone:
 * "Meeting Room · Big, 10 people · ৳1,000/hour".
 */
export function interestGroups(plans: readonly Plan[]): InterestGroup[] {
  return sortPlans(plans).map((plan) => ({
    label: plan.name,
    options: [
      { value: interestValue(plan.slug), label: `${plan.name}, any option` },
      ...plan.rates.map((rate) => {
        const { title, note } = rateTitle(rate);
        const name = note ? `${title}, ${note}` : title;
        return {
          value: interestValue(plan.slug, rate.id),
          label: `${plan.name} · ${name} · ${formatBdt(rate.amountBdt)}/${rateUnitLabel(rate)}`,
        };
      }),
    ],
  }));
}

/**
 * The interest a `/contact?plan=…&rate=…` link asks for ("Book this" on Spaces). A rate that
 * isn't the plan's falls back to the plan; an unknown plan to no choice at all.
 */
export function initialInterest(
  plans: readonly Plan[],
  plan: string | undefined,
  rate: string | undefined,
): string {
  const match = plans.find((p) => p.slug === plan);
  if (!match) return '';
  const rateMatch = match.rates.find((r) => r.id === rate);
  return interestValue(match.slug, rateMatch?.id);
}

/**
 * The plain-text label of an interest value, for the confirmation: the rate's option label, or
 * just the plan's name for "any option".
 */
export function interestLabel(groups: readonly InterestGroup[], value: string): string | undefined {
  for (const group of groups) {
    const option = group.options.find((o) => o.value === value);
    if (!option) continue;
    return parseInterest(value).rateId ? option.label : group.label;
  }
  return undefined;
}

/** The form's values from a submitted `FormData` (missing fields read as empty). */
export function formValues(data: FormData): InquiryFormValues {
  const values = { ...EMPTY_FORM_VALUES };
  for (const field of INQUIRY_FIELDS) {
    const value = data.get(field);
    values[field] = typeof value === 'string' ? value : '';
  }
  return values;
}

/** The request body for the API: the form's values, with the interest split back out. */
export function toInquiryInput(values: InquiryFormValues) {
  const { interest, ...rest } = values;
  return { ...rest, ...parseInterest(interest) };
}

/** Maps a contract path (`planSlug`) to the field that shows its error (`interest`). */
export function fieldForPath(path: string): InquiryField | undefined {
  if (path === 'planSlug' || path === 'rateId') return 'interest';
  return INQUIRY_FIELDS.find((field) => field === path);
}

export type FieldErrors = Partial<Record<InquiryField, string>>;

/**
 * Field errors from validation issues or the API's error details (`{ path, message }`), first
 * message per field. Issues that belong to no field are returned separately.
 */
export function fieldErrorsFrom(issues: readonly { path: string; message: string }[]): {
  fieldErrors: FieldErrors;
  unmatched: string[];
} {
  const fieldErrors: FieldErrors = {};
  const unmatched: string[] = [];
  for (const issue of issues) {
    const field = fieldForPath(issue.path);
    if (!field) unmatched.push(issue.message);
    else fieldErrors[field] ??= issue.message;
  }
  return { fieldErrors, unmatched };
}

/** The first field with an error, in form order. */
export function firstInvalidField(errors: FieldErrors): InquiryField | undefined {
  return INQUIRY_FIELDS.find((field) => errors[field] !== undefined);
}

/** What the confirmation card repeats back (only what was given). */
export interface InquiryReceipt {
  name: string;
  email: string;
  interest?: string;
  preferredDate?: string;
  teamSize?: number;
}

/**
 * Where a submission stands. `invalid` and `error` carry the values back, so a page rendered
 * without JS keeps what the visitor typed.
 */
export type InquiryFormState =
  | { status: 'idle' }
  | { status: 'success'; receipt: InquiryReceipt }
  | { status: 'invalid'; values: InquiryFormValues; fieldErrors: FieldErrors }
  | { status: 'error'; values: InquiryFormValues; message: string };

export const IDLE_STATE: InquiryFormState = { status: 'idle' };

/** Copy for a failed submission (B5): what happened and what to do, never the raw error. */
export function failureMessage(error: ApiFailure | { kind: 'offline' }): string {
  switch (error.kind) {
    case 'offline':
      return 'We couldn’t send that. Check your connection and try again.';
    case 'http':
      if (error.status === 429) {
        const wait = error.retryAfterS;
        const when =
          wait === undefined || wait <= 0
            ? 'in a minute'
            : wait < 60
              ? `in ${String(wait)} ${wait === 1 ? 'second' : 'seconds'}`
              : `in ${String(Math.ceil(wait / 60))} minutes`;
        return `That’s a few inquiries in a row. Try again ${when}, or call or email us.`;
      }
      return 'We couldn’t send that just now. Try again in a moment, or call or email us.';
    case 'timeout':
    case 'network':
    case 'invalid-response':
      return 'We couldn’t send that just now. Try again in a moment, or call or email us.';
  }
}

/** "Saturday, 10 October 2026" for an ISO date, read as a calendar date (no time zone shift). */
export function formatPreferredDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
