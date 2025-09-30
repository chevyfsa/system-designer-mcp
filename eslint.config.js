import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*'],
  },
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'test/**/*.ts', 'scripts/**/*.ts'], // Include source, test, and script files for TypeScript parsing
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        Console: 'readonly',
        process: 'readonly',
        Bun: 'readonly',
        NodeJS: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        AbortController: 'readonly',
        File: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      // Add any custom rules here
    },
  },
];
