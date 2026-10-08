/** Conventional Commits, e.g. `feat(web): plan finder [T6.2]`. */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['web', 'api', 'contracts', 'tsconfig', 'eslint-config', 'ci', 'deps', 'scripts', 'docs'],
    ],
    'body-max-line-length': [1, 'always', 100],
  },
};
