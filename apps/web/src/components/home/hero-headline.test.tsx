import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroHeadline } from '@/components/home/hero-headline';
import { HERO_WORDS } from '@/lib/hero-words';
import { wordCycle } from '@/styles/motion';
import { intersect } from '@/test/intersection';

/** Where a word stands in the cycle (the words are visual only, so there's no accessible handle). */
const slotOf = (word: string) =>
  screen.getByText(word, { selector: '[data-word-slot]' }).getAttribute('data-word-slot');
const currentWord = () => document.querySelector('[data-word-slot="current"]')?.textContent ?? null;

const nextTurn = () => {
  act(() => {
    vi.advanceTimersByTime(wordCycle.interval);
  });
};

const pauseButton = () => screen.getByRole('button', { name: 'Pause changing word' });

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  // The SSR test writes the markup straight into the body.
  document.body.innerHTML = '';
});

describe('HeroHeadline', () => {
  it('arrives as the first sentence, with no motion it cannot stop before JS', () => {
    document.body.innerHTML = renderToString(<HeroHeadline id="hero-title" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Your startup begins here.',
    );
    expect(slotOf('startup')).toBe('current');
    for (const word of HERO_WORDS.slice(1)) expect(slotOf(word)).toBe('waiting');
    // In place but invisible until it works.
    expect(document.querySelector('button')).toHaveClass('invisible');
  });

  it('rises in with the headline, then gives way to each word in turn', () => {
    render(<HeroHeadline id="hero-title" />);
    expect(screen.getByText('startup', { selector: '[data-word-slot]' })).toHaveClass(
      'animate-mask-up',
    );
    expect(pauseButton()).not.toHaveClass('invisible');

    nextTurn();
    expect(currentWord()).toBe('big idea');
    expect(slotOf('startup')).toBe('leaving');
    expect(screen.getByText('startup', { selector: '[data-word-slot]' })).not.toHaveClass(
      'animate-mask-up',
    );

    nextTurn();
    nextTurn();
    nextTurn();
    expect(currentWord()).toBe('startup');
    expect(slotOf('next chapter')).toBe('leaving');
  });

  it('keeps reading the same sentence to screen readers while the word changes', () => {
    render(<HeroHeadline id="hero-title" />);
    nextTurn();
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Your startup begins here.',
    );
  });

  it('stops for good with the pause button, and picks up again with it', () => {
    render(<HeroHeadline id="hero-title" />);
    const button = pauseButton();
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.blur(button);
    nextTurn();
    nextTurn();
    expect(currentWord()).toBe('startup');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    nextTurn();
    expect(currentWord()).toBe('big idea');
  });

  it('resumes when pressed again even though the button keeps focus', () => {
    render(<HeroHeadline id="hero-title" />);
    const button = pauseButton();

    fireEvent.focus(button);
    fireEvent.click(button);
    fireEvent.click(button);
    nextTurn();
    expect(currentWord()).toBe('big idea');
  });

  it('holds while the pause button has focus', () => {
    render(<HeroHeadline id="hero-title" />);
    const button = pauseButton();

    fireEvent.focus(button);
    nextTurn();
    expect(currentWord()).toBe('startup');

    fireEvent.blur(button);
    nextTurn();
    expect(currentWord()).toBe('big idea');
  });

  it('holds while a mouse is over the headline, not for a passing touch', () => {
    render(<HeroHeadline id="hero-title" />);
    const heading = screen.getByRole('heading', { level: 1 });

    fireEvent.pointerOver(heading, { pointerType: 'touch' });
    nextTurn();
    expect(currentWord()).toBe('big idea');
    fireEvent.pointerOut(heading, { pointerType: 'touch' });

    fireEvent.pointerOver(heading, { pointerType: 'mouse' });
    nextTurn();
    expect(currentWord()).toBe('big idea');

    fireEvent.pointerOut(heading, { pointerType: 'mouse' });
    nextTurn();
    expect(currentWord()).toBe('Monday');
  });

  it('holds while scrolled out of view or in a hidden tab', () => {
    render(<HeroHeadline id="hero-title" />);
    const heading = screen.getByRole('heading', { level: 1 });

    act(() => {
      intersect(heading, { isIntersecting: false, top: -900 });
    });
    nextTurn();
    expect(currentWord()).toBe('startup');
    act(() => {
      intersect(heading, { isIntersecting: true });
    });

    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    nextTurn();
    expect(currentWord()).toBe('startup');

    visibility.mockReturnValue('visible');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    nextTurn();
    expect(currentWord()).toBe('big idea');
  });
});
