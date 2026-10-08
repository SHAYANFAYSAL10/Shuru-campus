'use client';

import { useState } from 'react';

import { InquiryCreate, plansSeed } from '@campus/contracts';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useZodForm } from '@/lib/forms/use-zod-form';
import { toast } from '@/lib/toast';

/**
 * The real InquiryCreate contract driving the form primitives. Submit it empty to see focus move
 * to the first error. Nothing is sent: a valid submit fakes a short wait and shows a toast.
 */
export function FormDemo() {
  const [sending, setSending] = useState(false);
  const form = useZodForm(InquiryCreate, {
    defaultValues: { name: '', email: '', phone: '', planSlug: '', message: '' },
  });
  const { errors } = form.formState;

  const onValid = async (value: InquiryCreate) => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSending(false);
    form.reset();
    toast({
      tone: 'success',
      title: `Thanks, ${value.name}.`,
      description: 'This is the styleguide, so nothing was sent.',
    });
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit(onValid)(event);
      }}
      className="grid max-w-2xl gap-6 rounded-lg border border-border bg-surface p-6 sm:grid-cols-2 sm:p-8"
    >
      <Field label="Name" error={errors.name?.message}>
        <Input autoComplete="name" {...form.register('name')} />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register('email')} />
      </Field>
      <Field label="Phone" optional hint="Any format." error={errors.phone?.message}>
        <Input type="tel" autoComplete="tel" {...form.register('phone')} />
      </Field>
      <Field label="Space" optional error={errors.planSlug?.message}>
        <Select {...form.register('planSlug')}>
          <option value="">Not sure yet</option>
          {plansSeed.map((plan) => (
            <option key={plan.slug} value={plan.slug}>
              {plan.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Message" error={errors.message?.message} className="sm:col-span-2">
        <Textarea {...form.register('message')} />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" loading={sending} loadingLabel="Sending inquiry">
          Send inquiry
        </Button>
      </div>
    </form>
  );
}
