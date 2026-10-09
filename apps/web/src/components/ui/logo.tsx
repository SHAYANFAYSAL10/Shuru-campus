import Image from 'next/image';
import NextLink from 'next/link';

import { type Brand } from '@campus/contracts';

import { cn } from '@/lib/cn';

export interface LogoProps {
  brand: Pick<Brand, 'name' | 'logo'>;
  className?: string;
}

/**
 * The brand mark, linking home. A Fraunces wordmark of `brand.name` until the client supplies
 * logo files (`brand.logo.kind === 'image'`, with an optional dark-theme variant). Long names
 * wrap onto a second line instead of pushing the header off screen.
 */
export function Logo({ brand, className }: LogoProps) {
  const { logo } = brand;

  return (
    <NextLink
      href="/"
      className={cn(
        'inline-flex min-h-hit min-w-0 items-center rounded-sm text-fg transition-opacity hover:opacity-80',
        className,
      )}
    >
      {logo.kind === 'wordmark' ? (
        // Card-title optical size (as type-h3) at lead size, so it sits with the nav at 320px.
        <span className="line-clamp-2 font-display text-lead leading-tight font-medium [overflow-wrap:anywhere] [font-variation-settings:'opsz'_72,'SOFT'_50]">
          {brand.name}
        </span>
      ) : (
        <>
          {/* The logo's aspect ratio is unknown, so it is sized by height; SVGs skip optimisation. */}
          <Image
            src={logo.src}
            alt={logo.alt}
            width={160}
            height={40}
            unoptimized
            priority
            className={cn('h-8 w-auto max-w-full', logo.srcDark && 'dark:hidden')}
          />
          {logo.srcDark ? (
            <Image
              src={logo.srcDark}
              alt={logo.alt}
              width={160}
              height={40}
              unoptimized
              priority
              className="hidden h-8 w-auto max-w-full dark:block"
            />
          ) : null}
        </>
      )}
    </NextLink>
  );
}
