import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Odometer } from '@/components/motion/odometer';

function strips(container: HTMLElement): string[] {
  return [
    ...container.querySelectorAll<HTMLElement>('[data-odometer-digit] > span:last-child'),
  ].map((strip) => strip.style.transform);
}

describe('Odometer', () => {
  it('shows each digit by moving its 0–9 strip, with separators fixed', () => {
    const { container } = render(<Odometer text="2,800" />);
    const odometer = container.querySelector('[data-odometer]');

    expect(container.querySelectorAll('[data-odometer-digit]')).toHaveLength(4);
    expect(strips(container)).toEqual([
      'translateY(-20%)',
      'translateY(-80%)',
      'translateY(0%)',
      'translateY(0%)',
    ]);
    expect(odometer).toHaveTextContent(',');
    // At rest on first paint: nothing fades in.
    expect(odometer).not.toHaveAttribute('data-rolled');
  });

  it('rolls to a new figure, the ones first, adding places on the left', () => {
    const { container, rerender } = render(<Odometer text="2,800" />);
    const ones = container.querySelector('[data-odometer-digit]:last-child');

    rerender(<Odometer text="10,000" />);

    expect(container.querySelector('[data-odometer]')).toHaveAttribute('data-rolled');
    expect(strips(container)).toEqual([
      'translateY(-10%)',
      'translateY(0%)',
      'translateY(0%)',
      'translateY(0%)',
      'translateY(0%)',
    ]);
    // The ones column is the same element, so it rolls rather than being replaced.
    expect(container.querySelector('[data-odometer-digit]:last-child')).toBe(ones);
    const delays = [
      ...container.querySelectorAll<HTMLElement>('[data-odometer-digit] > span:last-child'),
    ].map((strip) => strip.style.transitionDelay);
    expect(delays).toEqual(['200ms', '150ms', '100ms', '50ms', '0ms']);
  });

  it('keeps an unchanged figure at rest', () => {
    const { container, rerender } = render(<Odometer text="650" />);
    rerender(<Odometer text="650" />);
    expect(container.querySelector('[data-odometer]')).not.toHaveAttribute('data-rolled');
  });
});
