'use client';

import { type LucideIcon } from 'lucide-react';
import { type ComponentProps } from 'react';

import { buttonClasses } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  /** Accessible name. Required: an icon alone never carries meaning (B3). */
  label: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  /** Show the label as a tooltip on hover and focus (B3). On by default. */
  tooltip?: boolean;
}

/**
 * A square, icon-only button: 36px (sm, touch target extended to 44px) or 44px (md). The label
 * is its accessible name and, by default, its tooltip.
 */
export function IconButton({
  label,
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  tooltip = true,
  disabled = false,
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  const button = (
    <button
      type={type}
      aria-label={label}
      disabled={disabled}
      className={cn(
        buttonClasses({ variant, size: size === 'sm' ? 'sm' : 'md', interactive: !disabled }),
        'shrink-0 px-0',
        size === 'sm' ? 'size-9' : 'size-11',
        className,
      )}
      {...rest}
    >
      <Icon aria-hidden="true" className={size === 'sm' ? 'size-4' : 'size-5'} strokeWidth={1.5} />
    </button>
  );
  return tooltip && !disabled ? <Tooltip content={label}>{button}</Tooltip> : button;
}
