'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { type Period, PERIOD_PARAM } from '@/lib/periods';

interface PeriodState {
  period: Period | undefined;
  setPeriod: (period: Period | undefined) => void;
}

const PeriodContext = createContext<PeriodState | null>(null);

/** The period chosen in the surrounding `<PeriodScope>`, and a way to change it. */
export function usePeriod(): PeriodState {
  const state = useContext(PeriodContext);
  if (!state) throw new Error('usePeriod needs a <PeriodScope> around it.');
  return state;
}

export interface PeriodScopeProps {
  /** From `?period=`, read by the page, so the server HTML is already filtered. */
  initialPeriod: Period | undefined;
  children: ReactNode;
  className?: string;
}

/**
 * Holds the Spaces period filter. The chosen period sits on this element as `data-period`, and
 * the plans, jump links and rates inside (Server Components) hide or highlight themselves through
 * `styles/spaces.css` (`data-offers`, `data-rate-period`), so filtering re-renders nothing but
 * this attribute. Changes replace `?period=` in the URL (no new history entry), so the view can be
 * shared and survives a reload. `data-period-changed` lets plans fade back in once the visitor
 * has changed the filter, never on first paint.
 */
export function PeriodScope({ initialPeriod, children, className }: PeriodScopeProps) {
  const [period, setPeriodState] = useState(initialPeriod);
  const [changed, setChanged] = useState(false);

  const setPeriod = useCallback((next: Period | undefined) => {
    setPeriodState(next);
    setChanged(true);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set(PERIOD_PARAM, next);
    else url.searchParams.delete(PERIOD_PARAM);
    // Next.js syncs its router with replaceState, so this stays a soft URL update.
    window.history.replaceState(null, '', url);
  }, []);

  const value = useMemo(() => ({ period, setPeriod }), [period, setPeriod]);

  return (
    <PeriodContext value={value}>
      <div
        data-period-scope=""
        data-period={period}
        data-period-changed={changed ? '' : undefined}
        className={className}
      >
        {children}
      </div>
    </PeriodContext>
  );
}
