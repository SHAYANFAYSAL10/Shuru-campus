import { type Plan, type Rate } from '@campus/contracts';

import { listText } from '@/lib/list-text';
import { type Period, periodInfo, planPeriods, ratePeriod } from '@/lib/periods';
import { planFromRate } from '@/lib/plans';

/**
 * The plan finder on Home (docs/05-pages-and-interactions.md → Home #4): three questions, one
 * suggested plan. `recommendPlan()` is a pure lookup over every combination of answers;
 * `resolveRecommendation()` then finds that plan and rate in whatever the API serves, so a plan
 * that's gone (or a rate that's renamed) degrades to "compare every plan", never a wrong price.
 */

export type Who = 'solo' | 'team' | 'group';
export type Need = 'desk' | 'room' | 'meeting';

export interface FinderAnswers {
  who: Who;
  often: Period;
  need: Need;
}

export interface FinderOption<T extends string> {
  value: T;
  label: string;
}

export interface FinderQuestion<K extends keyof FinderAnswers> {
  id: K;
  legend: string;
  options: readonly FinderOption<FinderAnswers[K]>[];
}

export const WHO_QUESTION: FinderQuestion<'who'> = {
  id: 'who',
  legend: 'Who’s working?',
  options: [
    { value: 'solo', label: 'Just me' },
    { value: 'team', label: '2–6 people' },
    { value: 'group', label: 'An event' },
  ],
};

export const OFTEN_QUESTION: FinderQuestion<'often'> = {
  id: 'often',
  legend: 'How often?',
  options: [
    { value: 'hourly', label: 'Hours' },
    { value: 'daily', label: 'Days' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ],
};

export const NEED_QUESTION: FinderQuestion<'need'> = {
  id: 'need',
  legend: 'What do you need?',
  options: [
    { value: 'desk', label: 'Desk' },
    { value: 'room', label: 'Private room' },
    { value: 'meeting', label: 'Meeting' },
  ],
};

/** In the order they're asked. */
export const FINDER_QUESTIONS = [WHO_QUESTION, OFTEN_QUESTION, NEED_QUESTION] as const;

export interface Recommendation {
  slug: Plan['slug'];
  /** The rate that fits; omitted when the size isn't known (the card shows the "from" price). */
  rateId?: Rate['id'];
}

// Desks by how long they're needed: a hot desk by the hour or day, a seat of your own beyond.
const DESK: Record<Period, Recommendation> = {
  hourly: { slug: 'hot-desk', rateId: 'hourly' },
  daily: { slug: 'hot-desk', rateId: 'daily' },
  weekly: { slug: 'business-seating', rateId: 'weekly' },
  monthly: { slug: 'business-seating', rateId: 'monthly' },
};

/**
 * The plan that suits the answers. Events always need the seminar room (its size decides the
 * rate, so none is picked). A meeting is a meeting room sized for one or a team. A room of your
 * own is a meeting room for hours or days (nothing else is let that briefly), else a cubicle for
 * one or an office for a team. A desk depends only on how long it's needed.
 */
export function recommendPlan({ who, often, need }: FinderAnswers): Recommendation {
  if (who === 'group') return { slug: 'seminar-room' };

  const solo = who === 'solo';
  const meetingRoom: Recommendation = { slug: 'meeting-room', rateId: solo ? 'mini' : 'small' };

  switch (need) {
    case 'meeting':
      return meetingRoom;
    case 'room':
      if (often === 'hourly' || often === 'daily') return meetingRoom;
      if (solo) return { slug: 'executive-seating', rateId: often };
      return { slug: 'private-office' };
    case 'desk':
      return DESK[often];
  }
}

export interface ResolvedRecommendation {
  plan: Plan;
  /** The recommended rate, when there is one and the plan still has it. */
  rate: Rate | undefined;
  /** The price to show: the recommended rate, else the plan's entry price. */
  price: Rate;
  /** Whether `price` is the plan's lowest ("From ৳…") rather than the exact rate. */
  isFrom: boolean;
}

/** The recommended plan and rate among `plans`, or `undefined` when the plan isn't offered. */
export function resolveRecommendation(
  recommendation: Recommendation,
  plans: readonly Plan[],
): ResolvedRecommendation | undefined {
  const plan = plans.find((p) => p.slug === recommendation.slug);
  if (!plan || plan.rates.length === 0) return undefined;
  const rate = plan.rates.find((r) => r.id === recommendation.rateId);
  return { plan, rate, price: rate ?? planFromRate(plan), isFrom: !rate };
}

/**
 * Said when the plan isn't booked as often as asked: "Booked by the hour, not by the month."
 * `undefined` when the shown price is already paid by that period, or the plan offers it.
 */
export function periodNote(
  { plan, rate }: Pick<ResolvedRecommendation, 'plan' | 'rate'>,
  often: Period,
): string | undefined {
  if (rate ? ratePeriod(rate) === often : planPeriods(plan).includes(often)) return undefined;
  const offered = planPeriods(plan).map((period) => periodInfo(period).adverb);
  return `Booked ${listText(offered, 'or')}, not ${periodInfo(often).adverb}.`;
}

/** How many of the three questions are answered. */
export function answeredCount(answers: Partial<FinderAnswers>): number {
  return FINDER_QUESTIONS.filter((question) => answers[question.id] !== undefined).length;
}

/** The answers, once all three are in. */
export function completeAnswers(answers: Partial<FinderAnswers>): FinderAnswers | undefined {
  const { who, often, need } = answers;
  return who && often && need ? { who, often, need } : undefined;
}
