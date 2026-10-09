// ESLint resolves the nearest eslint.config.* per file, so one root invocation covers
// every workspace (flag is the default from ESLint 10).
export default {
  '*.{ts,tsx,js,mjs,cjs}': [
    'eslint --flag unstable_config_lookup_from_file --fix --max-warnings=0 --no-warn-ignored',
    'prettier --write',
  ],
  '*.{json,css,md,mdx,yml,yaml}': 'prettier --write',
};
