import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { InquiryCreate, PLAN_SLUGS } from '@campus/contracts';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { applyApiErrors } from '@/lib/forms/api-errors';
import { useZodForm } from '@/lib/forms/use-zod-form';

function InquiryForm({ onValid }: { onValid: (value: InquiryCreate) => void }) {
  const form = useZodForm(InquiryCreate, {
    defaultValues: { name: '', email: '', phone: '', planSlug: '', message: '' },
  });
  const { errors } = form.formState;
  return (
    <form
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit(onValid)(event);
      }}
    >
      <Field label="Name" error={errors.name?.message}>
        <Input autoComplete="name" {...form.register('name')} />
      </Field>
      <Field label="Email" hint="We reply within one business day." error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register('email')} />
      </Field>
      <Field label="Phone" optional error={errors.phone?.message}>
        <Input type="tel" autoComplete="tel" {...form.register('phone')} />
      </Field>
      <Field label="Space" optional error={errors.planSlug?.message}>
        <Select {...form.register('planSlug')}>
          <option value="">Not sure yet</option>
          {PLAN_SLUGS.map((slug) => (
            <option key={slug} value={slug}>
              {slug}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Message" error={errors.message?.message}>
        <Textarea {...form.register('message')} />
      </Field>
      <Button type="submit">Send inquiry</Button>
    </form>
  );
}

describe('Field', () => {
  it('labels the control and describes it with the hint', () => {
    render(<InquiryForm onValid={vi.fn()} />);
    const email = screen.getByRole('textbox', { name: 'Email' });
    expect(email).toHaveAccessibleDescription('We reply within one business day.');
    expect(email).not.toHaveAttribute('aria-invalid');
  });

  it('marks optional fields in the label', () => {
    render(<InquiryForm onValid={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: 'Phone (optional)' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Space (optional)' })).toBeInTheDocument();
  });
});

describe('form validation', () => {
  it('moves focus to the first error on submit and announces it with the field', async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    render(<InquiryForm onValid={onValid} />);

    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));

    const name = screen.getByRole('textbox', { name: 'Name' });
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name.getAttribute('aria-describedby')).toBeTruthy();
    expect(name).toHaveAccessibleDescription(/.+/);

    // Every invalid field is marked, and the hint stays alongside the error.
    const email = screen.getByRole('textbox', { name: 'Email' });
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(/^We reply within one business day\. .+/);
    expect(onValid).not.toHaveBeenCalled();
  });

  it('clears an error as soon as the field is fixed', async () => {
    const user = userEvent.setup();
    render(<InquiryForm onValid={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));

    const name = screen.getByRole('textbox', { name: 'Name' });
    await user.type(name, 'Rahim');
    expect(name).not.toHaveAttribute('aria-invalid');
    expect(name).not.toHaveAccessibleDescription(/.+/);
  });

  it('submits parsed values when everything is valid', async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    render(<InquiryForm onValid={onValid} />);

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Rahim Uddin');
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'rahim@example.com');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Space (optional)' }),
      'hot-desk',
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Message' }),
      'Looking for a desk from next month.',
    );
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));

    expect(onValid).toHaveBeenCalledOnce();
    expect(onValid.mock.calls[0]?.[0]).toMatchObject({
      name: 'Rahim Uddin',
      email: 'rahim@example.com',
      planSlug: 'hot-desk',
    });
  });

  it('moves focus through the fields in order', async () => {
    const user = userEvent.setup();
    render(<InquiryForm onValid={vi.fn()} />);
    const order = ['Name', 'Email', 'Phone (optional)'];
    for (const label of order) {
      await user.tab();
      expect(screen.getByRole('textbox', { name: label })).toHaveFocus();
    }
  });
});

describe('applyApiErrors', () => {
  const apiError = (details?: { path: string; message: string }[]) => ({
    error: {
      code: 'VALIDATION_FAILED' as const,
      message: 'Some fields need attention.',
      requestId: 'req-1',
      ...(details ? { details } : {}),
    },
  });

  it('sets field errors, focuses only the first, and returns the rest', () => {
    const setError = vi.fn();
    const unmatched = applyApiErrors(
      apiError([
        { path: 'email', message: 'Enter a valid email.' },
        { path: 'message', message: 'Too short.' },
        { path: 'website', message: 'Nope.' },
      ]),
      setError,
      ['name', 'email', 'message'],
    );
    expect(setError).toHaveBeenNthCalledWith(
      1,
      'email',
      { type: 'server', message: 'Enter a valid email.' },
      { shouldFocus: true },
    );
    expect(setError).toHaveBeenNthCalledWith(
      2,
      'message',
      { type: 'server', message: 'Too short.' },
      { shouldFocus: false },
    );
    expect(unmatched).toEqual(['Nope.']);
  });

  it('returns the top-level message when there are no field details', () => {
    const setError = vi.fn();
    expect(applyApiErrors(apiError(), setError, ['name'])).toEqual(['Some fields need attention.']);
    expect(setError).not.toHaveBeenCalled();
  });
});

describe('Checkbox', () => {
  it('toggles with Space and links its error', async () => {
    const user = userEvent.setup();
    render(
      <Checkbox label="Email me about events" hint="Once a month at most." error="Required." />,
    );
    const box = screen.getByRole('checkbox', { name: 'Email me about events' });
    expect(box).toHaveAccessibleDescription('Once a month at most. Required.');
    expect(box).toHaveAttribute('aria-invalid', 'true');

    await user.tab();
    expect(box).toHaveFocus();
    await user.keyboard(' ');
    expect(box).toBeChecked();
  });
});

describe('Switch', () => {
  it('is announced as a switch and toggles by click and keyboard', async () => {
    const user = userEvent.setup();
    render(<Switch label="Inquiry form" hint="Show the contact form on the site." />);
    const toggle = screen.getByRole('switch', { name: 'Inquiry form' });
    expect(toggle).toHaveAccessibleDescription('Show the contact form on the site.');

    await user.click(screen.getByText('Inquiry form'));
    expect(toggle).toBeChecked();
    await user.keyboard(' ');
    expect(toggle).not.toBeChecked();
  });
});
