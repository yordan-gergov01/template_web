import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Feature modules under src/features/. Each one may import only itself and
// shared code, never another feature.
const FEATURES = ['auth', 'profile', 'users', 'prompts', 'llm-model'];

// Folders that are not shared code: nothing in a feature or in a shared folder
// may depend on them.
const APP_LAYERS = [
  '@/pages',
  '@/pages/**',
  '@/routes',
  '@/routes/**',
  '@/providers',
  '@/providers/**',
];

const restrictImports = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

// Cross-folder imports use the @/ alias so the rules below can see the target
// folder in the import path; relative imports stay within one folder.
const noParentImports = {
  group: ['../*', '../**'],
  message: 'Import from another folder through the @/ alias.',
};

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'src/lib/api/schema.gen.ts'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      'no-console': 'error',
      ...restrictImports([noParentImports]),
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat['recommended-latest'], reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
  },
  ...FEATURES.map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: restrictImports([
      noParentImports,
      {
        group: ['@/features/*', `!@/features/${feature}`, `!@/features/${feature}/**`],
        message: 'Features never import other features; compose them in a page.',
      },
      { group: APP_LAYERS, message: 'Features import only shared code.' },
    ]),
  })),
  {
    files: ['src/{components,hooks,lib,utils,config,types}/**/*.{ts,tsx}'],
    rules: restrictImports([
      noParentImports,
      {
        group: ['@/features', '@/features/**', ...APP_LAYERS],
        message: 'Shared code never depends on features, pages, routes or providers.',
      },
    ]),
  },
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'error' },
  },
);
