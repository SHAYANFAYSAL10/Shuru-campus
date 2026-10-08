// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/cn';

describe('cn', () => {
  it('joins conditional classes', () => {
    const state: Record<string, boolean> = { open: true, disabled: false };
    expect(
      cn('a', state.disabled && 'b', undefined, ['c', { d: state.open, e: state.disabled }]),
    ).toBe('a c d');
  });

  it('keeps a token type size next to a token text color', () => {
    expect(cn('text-h2 text-fg')).toBe('text-h2 text-fg');
  });

  it('resolves conflicts within our custom scales, last one wins', () => {
    expect(cn('text-small', 'text-body')).toBe('text-body');
    expect(cn('rounded-sm', 'rounded-lg')).toBe('rounded-lg');
    expect(cn('z-header', 'z-modal')).toBe('z-modal');
    expect(cn('duration-fast', 'duration-base')).toBe('duration-base');
    expect(cn('shadow-raise', 'shadow-overlay')).toBe('shadow-overlay');
    expect(cn('bg-surface', 'bg-bg-alt')).toBe('bg-bg-alt');
  });

  it('lets a type role override a bare size', () => {
    expect(cn('text-body', 'type-h2')).toBe('type-h2');
  });
});
