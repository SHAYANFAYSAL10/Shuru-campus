import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { siteSeed } from '@campus/contracts';

import { CtaBand } from '@/components/home/cta-band';
import { MEDIA } from '@/lib/hooks/use-media-query';
import { setMediaQuery } from '@/test/media';

const { phones } = siteSeed.contact;

describe('CtaBand', () => {
  it('asks for an inquiry, with a number to call instead', () => {
    render(<CtaBand phones={phones} inquiryForm />);
    expect(screen.getByRole('region', { name: 'Ready when you are.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Send an inquiry' })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.getByRole('link', { name: '+88 09666-731731' })).toHaveAttribute(
      'href',
      'tel:+8809666731731',
    );
    expect(screen.getByText(/reply within one business day/)).toBeInTheDocument();
  });

  it('pulls the button toward fine pointers', () => {
    setMediaQuery(MEDIA.finePointer, true);
    render(<CtaBand phones={phones} inquiryForm />);
    expect(
      screen.getByRole('link', { name: 'Send an inquiry' }).closest('[data-magnetic]'),
    ).toHaveAttribute('data-magnetic', 'on');
  });

  it('asks for a call when the inquiry form is switched off', () => {
    render(<CtaBand phones={phones} inquiryForm={false} />);
    expect(screen.queryByRole('link', { name: 'Send an inquiry' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Call +88 09666-731731' })).toHaveAttribute(
      'href',
      'tel:+8809666731731',
    );
    expect(screen.queryByText(/reply within one business day/)).not.toBeInTheDocument();
  });
});
