/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', 'postcss.config.js', 'tailwind.config.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react-refresh'],
  rules: {
    // Script uses --max-warnings 0; this rule is often noisy for app entry/layout files.
    'react-refresh/only-export-components': 'off',
  },
  overrides: [
    {
      files: ['api/**/*.ts', 'vite.config.ts'],
      env: { node: true, browser: false },
    },
  ],
};
