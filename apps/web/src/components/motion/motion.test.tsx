import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { BeginLine } from '@/components/motion/begin-line';
import { Magnetic } from '@/components/motion/magnetic';
import { Marquee } from '@/components/motion/marquee';
import { Reveal } from '@/components/motion/reveal';
import { SplitText } from '@/components/motion/split-text';
import { MEDIA } from '@/lib/hooks/use-media-query';
import { intersect } from '@/test/intersection';
import { setMediaQuery } from '@/test/media';

const reduceMotion = () => {
  setMediaQuery(MEDIA.reducedMotion, true);
};

describe('Reveal', () => {
  it('is in the SSR HTML and visible before any JS runs', () => {
    const html = renderToString(<Reveal>Hot desks from day one</Reveal>);
    expect(html).toContain('Hot desks from day one');
    expect(html).toContain('data-reveal="static"');
    expect(html).not.toContain('opacity-0');
  });

  it('leaves content that is already on screen alone', () => {
    render(<Reveal data-testid="r">Above the fold</Reveal>);
    const el = screen.getByTestId('r');
    act(() => {
      intersect(el, { isIntersecting: true });
    });
    expect(el).toHaveAttribute('data-reveal', 'static');
  });

  it('hides below-the-fold content after hydration and reveals it once in view', () => {
    render(
      <Reveal data-testid="r" index={2}>
        Below the fold
      </Reveal>,
    );
    const el = screen.getByTestId('r');
    act(() => {
      intersect(el, { isIntersecting: false, top: 2000 });
    });
    expect(el).toHaveAttribute('data-reveal', 'hidden');
    expect(el).toHaveClass('opacity-0');

    act(() => {
      intersect(el, { isIntersecting: true });
    });
    expect(el).toHaveAttribute('data-reveal', 'shown');
    expect(el).toHaveClass('animate-reveal');
    expect(el.style.animationDelay).toBe('100ms');

    // Reveals once: scrolling away and back changes nothing.
    act(() => {
      intersect(el, { isIntersecting: false, top: 2000 });
    });
    expect(el).toHaveAttribute('data-reveal', 'shown');
  });

  it('does not hide content scrolled past at hydration', () => {
    render(<Reveal data-testid="r">Scrolled past</Reveal>);
    const el = screen.getByTestId('r');
    act(() => {
      intersect(el, { isIntersecting: false, top: -500 });
    });
    expect(el).toHaveAttribute('data-reveal', 'static');
  });

  it('shows content that was scrolled past before it could reveal', () => {
    render(<Reveal data-testid="r">Skipped by an anchor jump</Reveal>);
    const el = screen.getByTestId('r');
    act(() => {
      intersect(el, { isIntersecting: false, top: 2000 });
    });
    expect(el).toHaveAttribute('data-reveal', 'hidden');
    act(() => {
      intersect(el, { isIntersecting: false, top: -800 });
    });
    expect(el).toHaveAttribute('data-reveal', 'static');
    expect(el).not.toHaveClass('opacity-0');
  });

  it('renders the final state under reduced motion', () => {
    reduceMotion();
    render(<Reveal data-testid="r">Calm</Reveal>);
    const el = screen.getByTestId('r');
    act(() => {
      intersect(el, { isIntersecting: false, top: 2000 });
    });
    expect(el).toHaveAttribute('data-reveal', 'static');
    expect(el).not.toHaveClass('opacity-0');
  });
});

describe('SplitText', () => {
  it('gives screen readers the sentence once and hides the animated words', () => {
    const { container } = render(<SplitText text="Your next chapter begins here" />);
    expect(screen.getByText('Your next chapter begins here')).toHaveClass('sr-only');
    const visual = container.querySelector('[aria-hidden="true"]');
    expect(visual?.textContent).toBe('Your next chapter begins here');
  });

  it('animates from CSS on mount, with a reduced-motion opt-out', () => {
    const html = renderToString(<SplitText text="Where work begins" trigger="mount" />);
    expect(html).toContain('animate-mask-up');
    expect(html).toContain('motion-reduce:animate-none');
    expect(html).toContain('animation-delay:100ms');
  });

  it('masks words below the fold until they scroll into view', () => {
    const { container } = render(<SplitText text="Quiet focus" />);
    const root = container.firstElementChild!;
    act(() => {
      intersect(root, { isIntersecting: false, top: 2000 });
    });
    expect(container.querySelectorAll('.mask-hidden')).toHaveLength(2);
    act(() => {
      intersect(root, { isIntersecting: true });
    });
    expect(container.querySelectorAll('.animate-mask-up')).toHaveLength(2);
  });

  it('shows the words in place under reduced motion', () => {
    reduceMotion();
    const { container } = render(<SplitText text="Quiet focus" />);
    act(() => {
      intersect(container.firstElementChild!, { isIntersecting: false, top: 2000 });
    });
    expect(container.querySelector('.mask-hidden')).toBeNull();
    expect(container.querySelector('.animate-mask-up')).toBeNull();
  });
});

describe('BeginLine', () => {
  it('is decorative', () => {
    const { container } = render(<BeginLine />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws on mount from CSS, and stays drawn under reduced motion', () => {
    const html = renderToString(<BeginLine draw="mount" delay={300} />);
    expect(html).toContain('animate-draw motion-reduce:animate-none');
    expect(html).toContain('animation-delay:300ms');
  });

  it('waits below the fold, then draws', () => {
    const { container } = render(<BeginLine draw="inView" />);
    const svg = container.querySelector('svg')!;
    act(() => {
      intersect(svg, { isIntersecting: false, top: 2000 });
    });
    expect(container.querySelector('path')).toHaveClass('begin-line-undrawn');
    act(() => {
      intersect(svg, { isIntersecting: true });
    });
    expect(container.querySelector('path')).toHaveClass('animate-draw');
  });

  it('appears fully drawn under reduced motion', () => {
    reduceMotion();
    const { container } = render(<BeginLine draw="inView" />);
    act(() => {
      intersect(container.querySelector('svg')!, { isIntersecting: false, top: 2000 });
    });
    expect(container.querySelector('path')?.getAttribute('class') ?? '').toBe('');
  });
});

describe('Marquee', () => {
  const items = ['Founders', 'Freelancers', 'Remote teams'];

  it('is a plain wrapped list in the SSR HTML (no motion before JS can pause it)', () => {
    const html = renderToString(<Marquee items={items} label="Who works here" />);
    expect(html).not.toContain('animate-marquee');
    expect(html).not.toContain('<button');
    expect(html).toContain('Remote teams');
  });

  it('scrolls once hydrated and has a visible pause control', async () => {
    const user = userEvent.setup();
    render(<Marquee items={items} label="Who works here" />);
    expect(screen.getByRole('list', { name: 'Who works here' })).toBeInTheDocument();
    // The duplicate copy is hidden from assistive tech.
    expect(screen.getAllByRole('listitem')).toHaveLength(items.length);

    const pause = screen.getByRole('button', { name: 'Pause scrolling list' });
    expect(pause).toHaveAttribute('aria-pressed', 'false');
    await user.click(pause);
    expect(pause).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('marquee-track')).toHaveClass('animation-paused');
  });

  it('can be swiped through while paused, and resumes from the button', async () => {
    const user = userEvent.setup();
    render(<Marquee items={items} label="Who works here" />);
    const track = screen.getByTestId('marquee-track');
    const pause = screen.getByRole('button', { name: 'Pause scrolling list' });

    await user.click(pause);
    expect(track.parentElement).toHaveClass('overflow-x-auto');
    expect(track.parentElement).toHaveAttribute('tabindex', '0');

    // The button keeps focus after the click; that must not hold the strip paused.
    await user.click(pause);
    expect(pause).toHaveFocus();
    expect(pause).toHaveAttribute('aria-pressed', 'false');
    expect(track).not.toHaveClass('animation-paused');
    expect(track.parentElement).toHaveClass('overflow-hidden');
    expect(track.parentElement).not.toContainElement(pause);
  });

  it('stops and becomes a static list under reduced motion', () => {
    reduceMotion();
    render(<Marquee items={items} label="Who works here" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(items.length);
  });
});

describe('Magnetic', () => {
  it('is active on fine pointers only', () => {
    setMediaQuery(MEDIA.finePointer, true);
    render(<Magnetic>Book a tour</Magnetic>);
    expect(screen.getByText('Book a tour')).toHaveAttribute('data-magnetic', 'on');
  });

  it('is off under reduced motion', () => {
    setMediaQuery(MEDIA.finePointer, true);
    reduceMotion();
    render(<Magnetic>Book a tour</Magnetic>);
    expect(screen.getByText('Book a tour')).toHaveAttribute('data-magnetic', 'off');
  });
});
