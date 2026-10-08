import { type LucideIcon } from 'lucide-react';
import { type ComponentProps } from 'react';

import { buttonClasses } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  /** Accessible name. Required: an icon alone never carries meaning (B3). */
  label: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

/** A square, icon-only button. 36px (sm, touch target extended to 44px) or 44px (md). */
export function IconButton({
  label,
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  return (
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
}
