'use client';

import { useSpring } from 'motion/react';
import * as m from 'motion/react-m';
import { type PointerEvent, type ReactNode, useEffect } from 'react';

import { cn } from '@/lib/cn';
import { useFinePointer, useReducedMotion } from '@/lib/hooks/use-media-query';
import { magneticOffset } from '@/lib/magnetic';
import { distance, spring } from '@/styles/motion';

export interface MagneticProps {
  children: ReactNode;
  /** Furthest pull toward the pointer, in px. Defaults to the 6px token. */
  strength?: number;
  className?: string;
}

const { stiffness, damping } = spring.soft;

/**
 * Pulls its child a few pixels toward the pointer (signature moment 7), never more than
 * `strength` in any direction. Mouse and pen on fine-pointer devices only: a touch on a hybrid
 * laptop doesn't drag it. Off under reduced motion. The child keeps its own hit area and focus ring.
 */
export function Magnetic({ children, strength = distance.magnetic, className }: MagneticProps) {
  const finePointer = useFinePointer();
  const reduced = useReducedMotion();
  const active = finePointer && !reduced;
  const x = useSpring(0, { stiffness, damping });
  const y = useSpring(0, { stiffness, damping });

  // Switching reduced motion on (or plugging in a touch screen) mid-pull lets go at once.
  useEffect(() => {
    if (active) return;
    x.jump(0);
    y.jump(0);
  }, [active, x, y]);

  function handleMove(event: PointerEvent<HTMLSpanElement>) {
    if (!active || event.pointerType === 'touch') return;
    const offset = magneticOffset(
      { x: event.clientX, y: event.clientY },
      event.currentTarget.getBoundingClientRect(),
      strength,
    );
    x.set(offset.x);
    y.set(offset.y);
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
