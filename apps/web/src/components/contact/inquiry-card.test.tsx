import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { plansSeed, siteSeed } from '@campus/contracts';

import { InquiryCard, type InquiryAction } from '@/components/contact/inquiry-card';
import {
  EMPTY_FORM_VALUES,
  interestGroups,
  type InquiryFormState,
  type InquiryFormValues,
} from '@/lib/inquiry-form';

const groups = interestGroups(plansSeed);
const contact = siteSeed.contact;
const dateRange = { min: '2026-10-09', max: '2027-10-09' };

function renderCard(
  action: InquiryAction,
  { initialValues = EMPTY_FORM_VALUES, withPlans = true } = {},
) {
  return render(
    <InquiryCard
      action={action}
      initialValues={initialValues}
      groups={withPlans ? groups : []}
      dateRange={dateRange}
      contact={contact}
    />,
  );
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Nadia Rahman');
  await user.type(screen.getByLabelText('Email'), 'nadia@example.com');
  await user.type(screen.getByLabelText(/^Message/), 'Looking for a room on Monday.');
}

const success: InquiryFormState = {
  status: 'success',
  receipt: {
    name: 'Nadia Rahman',
    email: 'nadia@example.com',
    interest: 'meeting-room:big',
    teamSize: 4,
  },
};

describe('InquiryCard', () => {
  it('is a named form with the space pre-selected from a "Book this" link', () => {
    const initialValues: InquiryFormValues = { ...EMPTY_FORM_VALUES, interest: 'meeting-room:big' };
    renderCard(vi.fn<InquiryAction>(), { initialValues });

    expect(screen.getByRole('form', { name: 'Send an inquiry' })).toBeInTheDocument();
    const space = screen.getByLabelText(/^Space/);
    expect(space).toHaveDisplayValue('Meeting Room · Big, 10 people · ৳1,000/hour');
    expect(screen.getByRole('group', { name: 'Meeting Room' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Preferred start date/)).toHaveAttribute('min', dateRange.min);
  });

  it('marks the errors and focuses the first, without sending', async () => {
    const user = userEvent.setup();
    const action = vi.fn<InquiryAction>();
    renderCard(action);

    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));

    const name = screen.getByLabelText('Name');
    await waitFor(() => {
      expect(name).toHaveFocus();
    });
    expect(name).toHaveAccessibleDescription('Name needs at least 2 characters.');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(action).not.toHaveBeenCalled();
  });

  it('sends, then morphs into thanks by name with what was asked, focused', async () => {
    const user = userEvent.setup();
    const reply = deferred<InquiryFormState>();
    const action = vi.fn<InquiryAction>(() => reply.promise);
    renderCard(action);

    await fillValid(user);
    await user.selectOptions(screen.getByLabelText(/^Space/), 'meeting-room:big');
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledOnce();
    });
    const data = action.mock.calls[0]?.[1];
    expect(data?.get('name')).toBe('Nadia Rahman');
    expect(data?.get('interest')).toBe('meeting-room:big');
    expect(screen.getByRole('button', { name: 'Sending inquiry' })).toHaveAttribute(
      'aria-busy',
      'true',
    );

    reply.resolve(success);

    const thanks = await screen.findByRole('heading', { name: 'Thanks, Nadia Rahman.' });
    await waitFor(() => {
      expect(thanks).toHaveFocus();
    });
    expect(screen.getByText(/reply within one business day/)).toHaveTextContent(
      'nadia@example.com',
    );
    expect(screen.getByText('Meeting Room · Big, 10 people · ৳1,000/hour')).toBeInTheDocument();
    expect(screen.getByText('4 people')).toBeInTheDocument();
  });

  it('starts over with an empty form', async () => {
    const user = userEvent.setup();
    renderCard(vi.fn<InquiryAction>(() => Promise.resolve(success)));

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));
    await user.click(await screen.findByRole('link', { name: 'Send another inquiry' }));

    expect(await screen.findByRole('form', { name: 'Send an inquiry' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('');
    });
  });

  it('keeps everything typed and offers a retry when sending fails', async () => {
    const user = userEvent.setup();
    const action = vi.fn<InquiryAction>((_previous, data) =>
      Promise.resolve({
        status: 'error',
        values: { ...EMPTY_FORM_VALUES, name: data.get('name') as string },
        message: 'We couldn’t send that just now. Try again in a moment, or call or email us.',
      }),
    );
    renderCard(action);

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));

    const banner = (await screen.findByText(/We couldn’t send that just now/)).closest(
      '[tabindex]',
    );
    await waitFor(() => {
      expect(banner).toHaveFocus();
    });
    expect(screen.getByLabelText('Name')).toHaveValue('Nadia Rahman');
    expect(screen.getByLabelText(/^Message/)).toHaveValue('Looking for a room on Monday.');
    expect(screen.getByRole('link', { name: contact.phones[0] })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(2);
    });
  });

  it('says to check the connection when the request itself fails', async () => {
    const user = userEvent.setup();
    renderCard(vi.fn<InquiryAction>(() => Promise.reject(new TypeError('Failed to fetch'))));

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));

    expect(await screen.findByText(/Check your connection and try again/)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('nadia@example.com');
  });

  it('puts errors found on the server on their fields', async () => {
    const user = userEvent.setup();
    renderCard(
      vi.fn<InquiryAction>((_previous, data) =>
        Promise.resolve({
          status: 'invalid',
          values: { ...EMPTY_FORM_VALUES, email: data.get('email') as string },
          fieldErrors: { preferredDate: 'Pick today or a later date.' },
        }),
      ),
    );

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));

    const date = screen.getByLabelText(/^Preferred start date/);
    await waitFor(() => {
      expect(date).toHaveFocus();
    });
    expect(date).toHaveAccessibleDescription('Pick today or a later date.');
  });

  it('leaves out the space when plans did not load', () => {
    renderCard(vi.fn<InquiryAction>(), { withPlans: false });
    expect(screen.queryByLabelText(/^Space/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('hides the honeypot from people and assistive tech', () => {
    renderCard(vi.fn<InquiryAction>());
    expect(screen.queryByRole('textbox', { name: /Website/ })).not.toBeInTheDocument();
    expect(document.querySelector('input[name="website"]')).toHaveAttribute('tabindex', '-1');
  });
});
