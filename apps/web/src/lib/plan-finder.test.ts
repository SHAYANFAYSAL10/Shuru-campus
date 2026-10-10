import { describe, expect, it } from 'vitest';

import { plansSeed, type Plan } from '@campus/contracts';

import { type Period } from '@/lib/periods';
import {
  answeredCount,
  completeAnswers,
  FINDER_QUESTIONS,
  type FinderAnswers,
  type Need,
  NEED_QUESTION,
  OFTEN_QUESTION,
  periodNote,
  recommendPlan,
  resolveRecommendation,
  type Who,
  WHO_QUESTION,
} from '@/lib/plan-finder';

function seedPlan(slug: Plan['slug']): Plan {
  const plan = plansSeed.find((p) => p.slug === slug);
  if (!plan) throw new Error(`seed has no ${slug}`);
  return plan;
}

// Every combination of answers (3 × 4 × 3), written out: who, how often, need → slug, rate, note.
type Row = [Who, Period, Need, string, string | undefined, string | undefined];

const BY_HOUR_NOT_DAY = 'Booked by the hour, not by the day.';
const BY_HOUR_NOT_WEEK = 'Booked by the hour, not by the week.';
const BY_HOUR_NOT_MONTH = 'Booked by the hour, not by the month.';
const BY_MONTH_NOT_WEEK = 'Booked by the month, not by the week.';

const TABLE: Row[] = [
  ['solo', 'hourly', 'desk', 'hot-desk', 'hourly', undefined],
  ['solo', 'hourly', 'room', 'meeting-room', 'mini', undefined],
  ['solo', 'hourly', 'meeting', 'meeting-room', 'mini', undefined],
  ['solo', 'daily', 'desk', 'hot-desk', 'daily', undefined],
  ['solo', 'daily', 'room', 'meeting-room', 'mini', BY_HOUR_NOT_DAY],
  ['solo', 'daily', 'meeting', 'meeting-room', 'mini', BY_HOUR_NOT_DAY],
  ['solo', 'weekly', 'desk', 'business-seating', 'weekly', undefined],
  ['solo', 'weekly', 'room', 'executive-seating', 'weekly', undefined],
  ['solo', 'weekly', 'meeting', 'meeting-room', 'mini', BY_HOUR_NOT_WEEK],
  ['solo', 'monthly', 'desk', 'business-seating', 'monthly', undefined],
  ['solo', 'monthly', 'room', 'executive-seating', 'monthly', undefined],
  ['solo', 'monthly', 'meeting', 'meeting-room', 'mini', BY_HOUR_NOT_MONTH],

  ['team', 'hourly', 'desk', 'hot-desk', 'hourly', undefined],
  ['team', 'hourly', 'room', 'meeting-room', 'small', undefined],
  ['team', 'hourly', 'meeting', 'meeting-room', 'small', undefined],
  ['team', 'daily', 'desk', 'hot-desk', 'daily', undefined],
  ['team', 'daily', 'room', 'meeting-room', 'small', BY_HOUR_NOT_DAY],
  ['team', 'daily', 'meeting', 'meeting-room', 'small', BY_HOUR_NOT_DAY],
  ['team', 'weekly', 'desk', 'business-seating', 'weekly', undefined],
  ['team', 'weekly', 'room', 'private-office', undefined, BY_MONTH_NOT_WEEK],
  ['team', 'weekly', 'meeting', 'meeting-room', 'small', BY_HOUR_NOT_WEEK],
  ['team', 'monthly', 'desk', 'business-seating', 'monthly', undefined],
  ['team', 'monthly', 'room', 'private-office', undefined, undefined],
  ['team', 'monthly', 'meeting', 'meeting-room', 'small', BY_HOUR_NOT_MONTH],

  ['group', 'hourly', 'desk', 'seminar-room', undefined, undefined],
  ['group', 'hourly', 'room', 'seminar-room', undefined, undefined],
  ['group', 'hourly', 'meeting', 'seminar-room', undefined, undefined],
  ['group', 'daily', 'desk', 'seminar-room', undefined, BY_HOUR_NOT_DAY],
  ['group', 'daily', 'room', 'seminar-room', undefined, BY_HOUR_NOT_DAY],
  ['group', 'daily', 'meeting', 'seminar-room', undefined, BY_HOUR_NOT_DAY],
  ['group', 'weekly', 'desk', 'seminar-room', undefined, BY_HOUR_NOT_WEEK],
  ['group', 'weekly', 'room', 'seminar-room', undefined, BY_HOUR_NOT_WEEK],
  ['group', 'weekly', 'meeting', 'seminar-room', undefined, BY_HOUR_NOT_WEEK],
  ['group', 'monthly', 'desk', 'seminar-room', undefined, BY_HOUR_NOT_MONTH],
  ['group', 'monthly', 'room', 'seminar-room', undefined, BY_HOUR_NOT_MONTH],
  ['group', 'monthly', 'meeting', 'seminar-room', undefined, BY_HOUR_NOT_MONTH],
];

describe('recommendPlan', () => {
  it('covers every combination of answers exactly once', () => {
    const combinations = WHO_QUESTION.options.length * OFTEN_QUESTION.options.length;
    expect(TABLE).toHaveLength(combinations * NEED_QUESTION.options.length);
    expect(new Set(TABLE.map(([who, often, need]) => `${who}/${often}/${need}`)).size).toBe(
      TABLE.length,
    );
  });

  it.each(TABLE)('%s, %s, %s → %s (%s)', (who, often, need, slug, rateId) => {
    expect(recommendPlan({ who, often, need })).toEqual(rateId ? { slug, rateId } : { slug });
  });

  it.each(TABLE)('%s, %s, %s resolves against the seed', (who, often, need, slug, rateId, note) => {
    const resolved = resolveRecommendation(recommendPlan({ who, often, need }), plansSeed);
    expect(resolved?.plan.slug).toBe(slug);
    expect(resolved?.rate?.id).toBe(rateId);
    expect(resolved?.isFrom).toBe(rateId === undefined);
    if (resolved) expect(periodNote(resolved, often)).toBe(note);
  });
});

describe('resolveRecommendation', () => {
  it('prices an exact rate', () => {
    const resolved = resolveRecommendation({ slug: 'hot-desk', rateId: 'daily' }, plansSeed);
    expect(resolved?.price).toMatchObject({ id: 'daily', amountBdt: 650 });
    expect(resolved?.isFrom).toBe(false);
  });

  it('falls back to the entry price without a rate', () => {
    const resolved = resolveRecommendation({ slug: 'private-office' }, plansSeed);
    expect(resolved?.rate).toBeUndefined();
    expect(resolved?.price).toMatchObject({ id: 'three-people', amountBdt: 40000 });
    expect(resolved?.isFrom).toBe(true);
  });

  it('falls back to the entry price when the rate is gone', () => {
    const resolved = resolveRecommendation({ slug: 'meeting-room', rateId: 'huge' }, plansSeed);
    expect(resolved?.rate).toBeUndefined();
    expect(resolved?.price).toMatchObject({ id: 'mini', amountBdt: 300 });
    expect(resolved?.isFrom).toBe(true);
  });

  it('gives up when the plan is not offered', () => {
    expect(resolveRecommendation({ slug: 'hot-desk' }, [])).toBeUndefined();
    const others = plansSeed.filter((plan) => plan.slug !== 'seminar-room');
    expect(resolveRecommendation({ slug: 'seminar-room' }, others)).toBeUndefined();
  });

  it('gives up on a plan without rates', () => {
    const empty = { ...seedPlan('hot-desk'), rates: [] } as unknown as Plan;
    expect(resolveRecommendation({ slug: 'hot-desk' }, [empty])).toBeUndefined();
  });
});

describe('periodNote', () => {
  it('lists every period a plan is booked by', () => {
    const plan = seedPlan('executive-seating');
    expect(periodNote({ plan, rate: undefined }, 'daily')).toBe(
      'Booked by the week or by the month, not by the day.',
    );
  });

  it('says nothing when the plan offers the period, with no rate picked', () => {
    expect(periodNote({ plan: seedPlan('hot-desk'), rate: undefined }, 'daily')).toBeUndefined();
  });
});

describe('answers', () => {
  const all: FinderAnswers = { who: 'team', often: 'monthly', need: 'room' };

  it('asks the three questions in order', () => {
    expect(FINDER_QUESTIONS.map((question) => question.id)).toEqual(['who', 'often', 'need']);
  });

  it('counts what has been answered', () => {
    expect(answeredCount({})).toBe(0);
    expect(answeredCount({ need: 'desk' })).toBe(1);
    expect(answeredCount(all)).toBe(3);
  });

  it('completes only with all three', () => {
    expect(completeAnswers({ who: 'team', often: 'monthly' })).toBeUndefined();
    expect(completeAnswers(all)).toEqual(all);
  });
});
