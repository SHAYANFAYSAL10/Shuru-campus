'use client';

import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useActionState, useState } from 'react';

import { type Contact } from '@campus/contracts';

import { InquiryForm } from '@/components/contact/inquiry-form';
import { InquirySuccess } from '@/components/contact/inquiry-success';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/hooks/use-media-query';
import {
  failureMessage,
  formValues,
  IDLE_STATE,
  type InquiryFormState,
  type InquiryFormValues,
  type InterestGroup,
} from '@/lib/inquiry-form';
import { ease, seconds } from '@/styles/motion';
import { radius } from '@/styles/shape';

const TITLE_ID = 'inquiry-title';

export type InquiryAction = (
  previous: InquiryFormState,
  data: FormData,
) => Promise<InquiryFormState>;

export interface InquiryCardProps {
  /** The `sendInquiry` server action. */
  action: InquiryAction;
  initialValues: InquiryFormValues;
  groups: readonly InterestGroup[];
  dateRange: { min: string; max: string };
  contact: Pick<Contact, 'phones' | 'email'>;
  className?: string;
}

/**
 * The contact page's inquiry card: the form, and the confirmation it morphs into once the
 * inquiry is in (docs/05 → Contact). The card resizes with a `layout` animation (transform only,
 * corners kept round) while the form fades out and the thanks fade in; under reduced motion it's
 * a short crossfade.
 *
 * Two ways in, one server action: without JS the form posts to it and the page renders its
 * result (`useActionState`); with JS the form calls it directly once the fields check out, so a
 * dropped connection becomes an error banner instead of an error page.
 */
export function InquiryCard({
  action,
  initialValues,
  groups,
  dateRange,
  contact,
  className,
}: InquiryCardProps) {
  const [postedState, postAction] = useActionState(action, IDLE_STATE);
  // Set once the visitor sends with JS (or starts over); it then wins over the posted state.
  const [sentState, setSentState] = useState<InquiryFormState | null>(null);
  const [sending, setSending] = useState(false);
  // Remounts the form for "Send another inquiry", so nothing from the last one lingers.
  const [round, setRound] = useState(0);
  const reduced = useReducedMotion();

  const state = sentState ?? postedState;
  const sentWithJs = sentState !== null;

  const send = async (data: FormData) => {
    setSending(true);
    try {
      setSentState(await action(state, data));
    } catch {
      // The action never throws, so this is the request itself failing: offline, or the server
      // unreachable.
      setSentState({
        status: 'error',
        values: formValues(data),
        message: failureMessage({ kind: 'offline' }),
      });
    } finally {
      setSending(false);
    }
  };

  const fade = {
    duration: seconds(reduced ? 'crossfade' : 'base'),
    ease: ease.out,
  };

  return (
    <m.div
      layout
      transition={{ layout: { duration: seconds('slow'), ease: ease.out } }}
      style={{ borderRadius: radius.lg }}
      className={cn(
        'relative overflow-hidden border border-border bg-surface p-6 sm:p-8 lg:p-10',
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {state.status === 'success' ? (
          <m.div
            key="success"
            layout="position"
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fade, delay: reduced ? 0 : seconds('fast') }}
          >
            <InquirySuccess
              receipt={state.receipt}
              groups={groups}
              contact={contact}
              focusOnMount={sentWithJs}
              onReset={() => {
                setSentState(IDLE_STATE);
                setRound((n) => n + 1);
              }}
            />
          </m.div>
        ) : (
          <m.div
            key={`form-${String(round)}`}
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <div className="mb-8 flex flex-col gap-2">
              <h2 id={TITLE_ID} className="type-h3 text-fg">
                Send an inquiry
              </h2>
              <p className="text-small text-fg-muted">
                Fields are required unless they say optional.
              </p>
            </div>
            <InquiryForm
              action={postAction}
              onSend={(data) => void send(data)}
              sending={sending}
              labelledBy={TITLE_ID}
              state={state}
              initialValues={round === 0 ? initialValues : { ...initialValues, interest: '' }}
              groups={groups}
              dateRange={dateRange}
              contact={contact}
            />
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}
