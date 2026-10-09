import { type ReactNode } from 'react';

import { type SocialPlatform } from '@campus/contracts';

import { cn } from '@/lib/cn';

/** Display names, also the links' accessible names. */
export const SOCIAL_LABEL: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X',
};

/**
 * Outline marks on Lucide's 24px grid, drawn with the same 1.5px stroke as every other icon
 * (Lucide no longer ships brand icons).
 */
const PATHS: Record<SocialPlatform, ReactNode> = {
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  instagram: (
    <>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  x: (
    <>
      <path d="M4 4l11.733 16H20L8.267 4z" />
      <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
    </>
  ),
};

export interface SocialIconProps {
  platform: SocialPlatform;
  className?: string;
}

/** A social network's mark. Decorative: the link around it carries the name. */
export function SocialIcon({ platform, className }: SocialIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5', className)}
    >
      {PATHS[platform]}
    </svg>
  );
}
