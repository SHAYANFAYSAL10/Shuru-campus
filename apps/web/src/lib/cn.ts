import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge only knows Tailwind's default scale. Teach it ours (tokens.css, base.css),
// otherwise it reads `text-h2` as a color and drops it next to `text-fg`.
const twMerge = extendTailwindMerge<'type-role'>({
  extend: {
    theme: {
      text: ['display', 'h1', 'h2', 'h3', 'lead', 'body', 'small', 'eyebrow'],
      radius: ['sm', 'md', 'lg', 'full'],
      shadow: ['raise', 'overlay'],
      ease: ['out', 'in-out', 'in'],
      animate: [
        'reveal',
        'mask-up',
        'draw',
        'fade-in',
        'fade-out',
        'spin',
        'pulse-dot',
        'skeleton',
        'overlay-in',
        'dialog-in',
        'dialog-out',
        'sheet-in-right',
        'sheet-out-right',
        'sheet-in-left',
        'sheet-out-left',
        'sheet-in-bottom',
        'sheet-out-bottom',
        'toast-in',
        'toast-swipe-out',
      ],
      spacing: ['section', 'gutter', 'page', 'hit'],
    },
    classGroups: {
      'type-role': ['type-display', 'type-h1', 'type-h2', 'type-h3', 'type-lead', 'type-eyebrow'],
      z: [{ z: ['base', 'raised', 'sticky', 'header', 'overlay', 'modal', 'toast'] }],
      duration: [{ duration: ['instant', 'fast', 'base', 'slow', 'story'] }],
    },
    conflictingClassGroups: {
      'type-role': ['font-size', 'leading', 'tracking', 'font-family', 'font-weight'],
    },
  },
});

/** Joins class names and resolves Tailwind conflicts, last one wins. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
