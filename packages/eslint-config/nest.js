// NestJS config: Node globals; DI-friendly relaxations.
import globals from 'globals';

import { base } from './base.js';

/**
 * @param {{ tsconfigRootDir: string; ignores?: string[] }} options
 * @returns {import('eslint').Linter.Config[]}
 */
export function nestConfig(options) {
  return [
    ...base(options),
    {
      languageOptions: { globals: { ...globals.node, ...globals.jest } },
      rules: {
        // Nest modules and DTO holders are classes with only decorators/static members.
        '@typescript-eslint/no-extraneous-class': 'off',
        // Injected types must be value imports so decorator metadata can see them.
        '@typescript-eslint/consistent-type-imports': 'off',
      },
    },
  ];
}
