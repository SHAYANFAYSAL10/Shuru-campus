// Shared flat config: TypeScript strict (type-checked), import order, Prettier last.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';

/**
 * @param {{ tsconfigRootDir: string; ignores?: string[] }} options
 * @returns {import('eslint').Linter.Config[]}
 */
export function base({ tsconfigRootDir, ignores = [] }) {
  return [
    {
      ignores: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
        '**/.turbo/**',
        '**/playwright-report/**',
        '**/test-results/**',
        '**/next-env.d.ts',
        ...ignores,
      ],
    },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      plugins: { 'import-x': importX },
      settings: {
        'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true })],
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
        'import-x/no-duplicates': 'error',
        'import-x/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
            pathGroups: [
              { pattern: '@campus/**', group: 'internal', position: 'before' },
              { pattern: '@/**', group: 'internal' },
            ],
            pathGroupsExcludedImportTypes: ['builtin'],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true },
          },
        ],
        'no-restricted-imports': [
          'error',
          { patterns: [{ group: ['../../*'], message: 'Use a path alias (e.g. @/…) instead.' }] },
        ],
        eqeqeq: ['error', 'always'],
        'no-console': 'error',
      },
    },
    {
      files: ['**/*.{js,mjs,cjs}'],
      ...tseslint.configs.disableTypeChecked,
    },
    {
      files: ['**/*.{test,spec,e2e-spec}.{ts,tsx}', '**/test/**/*.ts', '**/e2e/**/*.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/unbound-method': 'off',
      },
    },
    prettier,
  ];
}
