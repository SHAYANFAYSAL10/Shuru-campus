'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

import { IconButton } from '@/components/ui/icon-button';
import { toast } from '@/lib/toast';

/** How long the check mark stays after a copy, in ms. */
const COPIED_MS = 2000;

export interface CopyButtonProps {
  value: string;
  /** Accessible name and tooltip, e.g. "Copy email address". */
  label: string;
  /** Toast title on success, e.g. "Email address copied". */
  copiedMessage: string;
  className?: string;
}

/**
 * Copies `value` to the clipboard, confirmed by a check mark and a toast (announced politely).
 * When the clipboard is unavailable, an error toast says what to do instead.
 */
export function CopyButton({ value, label, copiedMessage, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => {
      setCopied(false);
    }, COPIED_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ title: copiedMessage, description: value, tone: 'success' });
    } catch {
      toast({
        title: "Couldn't copy",
        description: `Select ${value} and copy it instead.`,
        tone: 'error',
      });
    }
  };

  return (
    <IconButton
      label={label}
      icon={copied ? Check : Copy}
      size="sm"
      className={className}
      onClick={() => void copy()}
    />
  );
}
