import { type Brand } from '@campus/contracts';

import { BeginLine } from '@/components/motion/begin-line';
import { cn } from '@/lib/cn';
import { nameFont } from '@/styles/fonts-name';

export interface NameMeaningProps {
  shortName: Brand['shortName'];
  /** Optional in the brand config; the section is left out without it (a renamed brand). */
  nameMeaning: Brand['nameMeaning'];
}

const TITLE_ID = 'name-title';

/**
 * About, the meaning of the name (docs/04-design-system.md §1): the original word at display
 * size with the begin line drawing under it, then what it means. The page's one lake band (A5).
 * The word sits inside the heading, so heading navigation lands on it, and carries its own
 * `lang` (WCAG 3.1.2) so a screen reader voices it in that language. Copy never assumes the
 * meaning is "beginning": it all comes from `brand.nameMeaning`.
 */
export function NameMeaning({ shortName, nameMeaning }: NameMeaningProps) {
  if (!nameMeaning) return null;
  const { word, language, lang, meaning } = nameMeaning;

  return (
    <section aria-labelledby={TITLE_ID} className={cn(nameFont.variable, 'surface-brand')}>
      <div className="mx-auto grid max-w-content gap-6 py-section px-page-safe lg:grid-cols-12 lg:gap-gutter">
        <p className="type-eyebrow lg:col-span-12">The name</p>
        <h2
          id={TITLE_ID}
          className="grid items-end gap-6 lg:col-span-12 lg:grid-cols-subgrid lg:gap-gutter"
        >
          <span className="flex w-fit max-w-full flex-col lg:col-span-7">
            <span lang={lang} className="type-name-word break-words">
              {word}
            </span>
            <BeginLine draw="inView" />
          </span>{' '}
          {/* The space keeps the word apart in the heading's name; the grid doesn't render it. */}
          <span className="type-h2 text-balance lg:col-span-5 lg:pb-6">
            {shortName} is {language} for <em>{meaning}</em>.
          </span>
        </h2>
        <p className="max-w-prose type-lead text-pretty lg:col-span-5 lg:col-start-8">
          It’s the idea behind everything here, from the light and the quiet to the way the day
          runs.
        </p>
      </div>
    </section>
  );
}
