// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    ignores: [
      'dist',            // build output
      'node_modules',    // dependencies
    ],
  },
  // Base ESLint recommended
  eslint.configs.recommended,
  // TypeScript rules (type-aware)
  ...tseslint.configs.recommendedTypeChecked,
  // Prettier formatting
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: './tsconfig.json',      // 👈 important for type-aware linting
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
  },
  {
    rules: {
      // Customize rules
      '@typescript-eslint/no-explicit-any': 'off',      // allow `any`
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      // Prettier integration
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
