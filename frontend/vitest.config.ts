import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  // Pre-bundling these on a cold cache (e.g. CI/Docker, no node_modules/.vite)
  // avoids Vite reloading the page mid-run, which crashes browser-mode tests
  // with "Vitest failed to find the current suite".
  // https://github.com/storybookjs/storybook/issues/33067
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-dev-runtime'],
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          // Reduces the chance of hitting the same reload race when multiple
          // story files start concurrently on a cold cache.
          fileParallelism: false,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        resolve: {
          tsconfigPaths: true,
        },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
    ],
  },
});
