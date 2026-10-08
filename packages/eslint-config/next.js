// Next.js app config: React rules + Next's core-web-vitals rules.
import nextPlugin from '@next/eslint-plugin-next';

import { reactConfig } from './react.js';

/**
 * @param {{ tsconfigRootDir: string; ignores?: string[] }} options
 * @returns {import('eslint').Linter.Config[]}
 */
export function nextConfig(options) {
  return [
    ...reactConfig(options),
    {
      plugins: { '@next/next': nextPlugin },
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
      },
    },
  ];
}
