import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Accordion, AccordionItem } from '@/components/ui/accordion';

describe('Accordion', () => {
  it('is a group of native disclosures, closed at first, opened from the summary', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Accordion>
        <AccordionItem id="refunds" group="faq" title="How do refunds work?">
          <p>Within 48 hours.</p>
        </AccordionItem>
        <AccordionItem group="faq" title="When are you open?">
          <p>Saturday to Thursday.</p>
        </AccordionItem>
      </Accordion>,
    );
    const details = container.querySelectorAll('details');
    expect(details).toHaveLength(2);
    expect(details[0]).toHaveAttribute('id', 'refunds');
    expect(details[0]).toHaveAttribute('name', 'faq');
    expect(details[0]).not.toHaveAttribute('open');

    const summary = screen.getByText('How do refunds work?').closest('summary');
    if (!summary) throw new Error('no summary');
    // jsdom only toggles on click; the native Enter/Space handling is covered in e2e.
    await user.click(summary);
    expect(details[0]).toHaveAttribute('open');
    expect(screen.getByText('Within 48 hours.')).toBeVisible();
  });
});
