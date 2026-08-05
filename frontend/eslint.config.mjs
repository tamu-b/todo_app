// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Storybook static build output.
    'storybook-static/**',
    // Auto-generated from docs/openapi.yaml via `npm run gen:api-types`.
    'src/types/api-schema.d.ts',
  ]),
  ...storybook.configs['flat/recommended'],
  eslintPluginPrettierRecommended,
  eslintConfigPrettier,
  {
    rules: {
      curly: ['error', 'all'],
      'object-shorthand': ['error', 'always'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '../**/components/*',
                '../**/constants/*',
                '../**/features/*',
                '../**/lib/*',
                '../**/test/*',
                '../**/types/*',
              ],
              message: 'Use the `@/` alias instead of a relative path.',
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
