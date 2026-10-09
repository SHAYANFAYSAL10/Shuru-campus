import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { defaultBrand } from '@campus/contracts';

import { BrandProvider, useBrand } from '@/components/providers/brand-provider';

function BrandName() {
  return <p>{useBrand().name}</p>;
}

describe('BrandProvider', () => {
  it('gives client components the brand from the layout', () => {
    render(
      <BrandProvider brand={{ ...defaultBrand, name: 'Test Hub' }}>
        <BrandName />
      </BrandProvider>,
    );

    expect(screen.getByText('Test Hub')).toBeInTheDocument();
  });

  it('fails loudly when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<BrandName />)).toThrow(/inside <BrandProvider>/);
  });
});
