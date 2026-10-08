'use client';

import { Bell, Copy, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { type ToastTone, toast } from '@/lib/toast';

const TOASTS: Record<ToastTone, { label: string; title: string; description: string }> = {
  info: {
    label: 'Info toast',
    title: 'Preview mode',
    description: 'Changes are checked but not saved yet.',
  },
  success: { label: 'Success toast', title: 'Email copied', description: 'Paste it anywhere.' },
  error: {
    label: 'Error toast',
    title: "We couldn't send that.",
    description: 'Check your connection and try again.',
  },
};

export function OverlayDemos() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Open dialog</Button>
          </DialogTrigger>
          <DialogContent
            title="Book a tour"
            description="Pick a day that suits you."
            footer={
              <>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Request tour</Button>
                </DialogClose>
              </>
            }
          >
            <Field label="Preferred day">
              <Input type="date" />
            </Field>
          </DialogContent>
        </Dialog>

        {(['right', 'bottom', 'full'] as const).map((side) => (
          <Sheet key={side}>
            <SheetTrigger asChild>
              <Button variant="secondary">Sheet: {side}</Button>
            </SheetTrigger>
            <SheetContent
              side={side}
              title={side === 'full' ? 'Menu' : 'Filters'}
              description={
                side === 'full' ? undefined : 'Sheets slide in from an edge and trap focus.'
              }
            >
              <nav aria-label="Example" className="flex flex-col gap-4 py-4">
                {['Spaces', 'About', 'Gallery', 'Contact'].map((item) => (
                  <a key={item} href="#overlays" className="type-h2 text-fg">
                    {item}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <IconButton label="Settings" icon={Settings} variant="secondary" />
        <IconButton label="Notifications" icon={Bell} />
        <IconButton label="Copy email" icon={Copy} size="sm" variant="secondary" />
        <span className="text-small text-fg-muted">Hover or Tab to an icon button.</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {(Object.keys(TOASTS) as ToastTone[]).map((tone) => (
          <Button
            key={tone}
            variant="secondary"
            onClick={() => {
              const { title, description } = TOASTS[tone];
              toast({ tone, title, description });
            }}
          >
            {TOASTS[tone].label}
          </Button>
        ))}
      </div>
    </div>
  );
}
