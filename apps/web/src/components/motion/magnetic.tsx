'use client';

import { useSpring } from 'motion/react';
import * as m from 'motion/react-m';
import { type PointerEvent, type ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { useFinePointer, useReducedMotion } from '@/lib/hooks/use-media-query';
import { distance, spring } from '@/styles/motion';

export interface MagneticProps {
  children: ReactNode;
  /** Furthest pull toward the pointer, in px. Defaults to the 6px token. */
  strength?: number;
  className?: string;
}

const { stiffness, damping } = spring.soft;

function clampUnit(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

/**
 * Pulls its child a few pixels toward the pointer (signature moment 7). Fine pointers only,
 * and off under reduced motion. The child keeps its own hit area and focus ring.
 */
export function Magnetic({ children, strength = distance.magnetic, className }: MagneticProps) {
  const finePointer = useFinePointer();
  const reduced = useReducedMotion();
  const active = finePointer && !reduced;
  const x = useSpring(0, { stiffness, damping });
  const y = useSpring(0, { stiffness, damping });

  function handleMove(event: PointerEvent<HTMLSpanElement>) {
    if (!active) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    x.set(clampUnit(dx) * strength);
    y.set(clampUnit(dy) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <m.span
      className={cn('inline-block', className)}
      style={{ x, y }}
      data-magnetic={active ? 'on' : 'off'}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </m.span>
  );
}
