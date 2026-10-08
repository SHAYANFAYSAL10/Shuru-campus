// Root config: repo scripts and tooling configs (plain JS, no type information).
import globals from 'globals';

import { base } from '@campus/eslint-config/base';

export default [
  ...base({ tsconfigRootDir: import.meta.dirname, ignores: ['apps/**', 'packages/**'] }),
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'off' },
  },
];
