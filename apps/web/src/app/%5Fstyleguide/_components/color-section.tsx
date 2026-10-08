import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SgGroup } from '@/app/%5Fstyleguide/_components/sg-section';
import { ThemePair } from '@/app/%5Fstyleguide/_components/theme-pair';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import {
  AA,
  contrastRatio,
  parseTokenSheet,
  semanticHex,
  type Theme,
  type TokenSheet,
} from '@/lib/color/contrast';

// docs/10-design-guidelines.md → A3.
const SEMANTIC: [token: string, use: string][] = [
  ['bg', 'Page background'],
  ['bg-alt', 'Alternating sections, sunken wells'],
  ['surface', 'Cards, inputs, menus, dialogs'],
  ['fg', 'Headlines, body'],
  ['fg-muted', 'Supporting text'],
  ['fg-subtle', 'Meta, captions, placeholders'],
  ['border', 'Decorative dividers'],
  ['border-strong', 'Inputs and control outlines'],
  ['accent', 'Primary CTA fill, begin line'],
  ['accent-text', 'Accent-colored text and links'],
  ['accent-subtle', 'Highlight background'],
  ['brand', 'Secondary emphasis, icons'],
  ['brand-surface', 'The lake band'],
  ['info-subtle', 'Info banners'],
  ['focus', 'Focus ring'],
  ['success', 'Success text and icons'],
  ['danger', 'Errors, destructive actions'],
];

// Pairs components may use (A5 rule 2), with their AA minimum.
const PAIRS: [fg: string, bg: string, min: number][] = [
  ['fg', 'bg', AA.text],
  ['fg-muted', 'bg', AA.text],
  ['fg-subtle', 'bg-alt', AA.text],
  ['accent-text', 'surface', AA.text],
  ['accent-text', 'accent-subtle', AA.text],
  ['on-accent', 'accent', AA.text],
  ['on-brand', 'brand-surface', AA.text],
  ['danger', 'surface', AA.text],
  ['border-strong', 'bg', AA.ui],
  ['focus', 'bg', AA.ui],
];

function loadSheet(): TokenSheet {
  return parseTokenSheet(readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8'));
}

function Swatches() {
  return (
    <ul className="grid gap-x-6 gap-y-4 @xl:grid-cols-2">
      {SEMANTIC.map(([token, use]) => (
        <li key={token} className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="size-10 shrink-0 rounded-md border border-border"
            style={{ backgroundColor: `var(--color-${token})` }}
          />
          <span className="min-w-0">
            <code className="block font-mono text-small break-words text-fg">--color-{token}</code>
            <span className="block text-small text-fg-muted">{use}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Pairs({ sheet, theme }: { sheet: TokenSheet; theme: Theme }) {
  return (
    <ul className="grid gap-3 @xl:grid-cols-2">
      {PAIRS.map(([fg, bg, min]) => {
        const ratio = contrastRatio(semanticHex(sheet, fg, theme), semanticHex(sheet, bg, theme));
        const passes = ratio >= min;
        return (
          <li
            key={`${fg}/${bg}`}
            className="flex min-w-0 items-center gap-3 rounded-md border border-border p-3"
          >
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-sm border border-border font-display text-body"
              style={{ color: `var(--color-${fg})`, backgroundColor: `var(--color-${bg})` }}
            >
              Aa
            </span>
            <span className="min-w-0 flex-1 text-small">
              <span className="block font-mono break-words text-fg">
                {fg} on {bg}
              </span>
              <span className="block text-fg-muted">
                {min === AA.text ? 'Text' : 'UI'}, needs {min}:1
              </span>
            </span>
            <span
              className={cn(
                'shrink-0 font-mono text-small tabular-nums',
                passes ? 'text-success' : 'text-danger',
              )}
            >
              {ratio.toFixed(2)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ColorSection() {
  const sheet = loadSheet();
  const palette = [...sheet.palette.entries()];

  return (
    <>
      <SgGroup
        title="Semantic tokens"
        note="Components use only these. Each one resolves per theme, so the same markup is shown in both."
      >
        <ThemePair className="@container">
          <Swatches />
        </ThemePair>
      </SgGroup>

      <SgGroup
        title="Contrast, computed from tokens.css"
        note="Calculated from the shipped hex values. contrast.test.ts asserts the full A4 matrix in CI."
      >
        <ThemePair className="@container">
          {(theme) => <Pairs sheet={sheet} theme={theme} />}
        </ThemePair>
      </SgGroup>

      <SgGroup
        title="The lake band"
        note="At most once per page. On it the focus ring switches to the accent, and in dark mode a hairline separates it from the page."
      >
        <ThemePair>
          <div className="rounded-lg border border-transparent surface-brand p-6 sm:p-8 dark:border-border">
            <p className="type-eyebrow">Lake band</p>
            <p className="mt-3 type-h3">Calm over clever.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button variant="onBrand">Book a tour</Button>
              <Button variant="onBrand" data-preview="focus">
                Focused
              </Button>
            </div>
          </div>
        </ThemePair>
      </SgGroup>

      <SgGroup
        title="Raw palette"
        note="Never used directly in components. These values build the semantic tokens."
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {palette.map(([name, hex]) => (
            <li key={name} className="flex min-w-0 flex-col gap-2">
              <span
                aria-hidden="true"
                className="h-14 rounded-md border border-border"
                style={{ backgroundColor: hex }}
              />
              <span className="text-small">
                <span className="block font-mono break-words text-fg">{name}</span>
                <span className="block font-mono text-fg-subtle uppercase">{hex}</span>
              </span>
            </li>
          ))}
        </ul>
      </SgGroup>
    </>
  );
}
