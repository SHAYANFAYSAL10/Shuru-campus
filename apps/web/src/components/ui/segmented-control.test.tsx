import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sun } from 'lucide-react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { SegmentedControl, type SegmentedOption } from '@/components/ui/segmented-control';

type Period = 'hour' | 'day' | 'month';
const OPTIONS: readonly SegmentedOption<Period>[] = [
  { value: 'hour', label: 'Hourly' },
  { value: 'day', label: 'Daily' },
  { value: 'month', label: 'Monthly', icon: Sun },
];

function Controlled({ initial }: { initial?: Period }) {
  const [value, setValue] = useState<Period | undefined>(initial);
  return (
    <SegmentedControl
      legend="Billing period"
      options={OPTIONS}
      value={value}
      onValueChange={setValue}
    />
  );
}

describe('SegmentedControl', () => {
  it('is a named radio group with the current value checked', () => {
    render(<Controlled initial="day" />);
    expect(screen.getByRole('group', { name: 'Billing period' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Daily' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Hourly' })).not.toBeChecked();
  });

  it('moves the selection with arrow keys and wraps around', async () => {
    const user = userEvent.setup();
    render(<Controlled initial="hour" />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Hourly' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Daily' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Daily' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  });

  it('is a single tab stop', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Controlled initial="day" />
        <button type="button">After</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Daily' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('selects on click', async () => {
    const user = userEvent.setup();
    render(<Controlled initial="hour" />);
    await user.click(screen.getByText('Monthly'));
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  });

  it('can start with nothing selected', () => {
    render(<Controlled />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
  });

  it('keeps labels for screen readers when showing icons only', () => {
    render(
      <SegmentedControl
        legend="Theme"
        hideLegend
        iconOnly
        options={OPTIONS}
        value="month"
        onValueChange={() => undefined}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
    expect(screen.getByText('Theme')).toHaveClass('sr-only');
  });
});
