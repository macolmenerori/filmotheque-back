import tseslint from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  // Replaces .eslintignore
  {
    ignores: ['node_modules/**', 'types/**', 'jest.config.js', '.github/**', 'build/**', 'dist/**']
  },

  // Replaces extends: 'plugin:@typescript-eslint/recommended' (wires parser + rules)
  ...tseslint.configs['flat/recommended'],

  // Replaces extends: 'prettier' + rule prettier/prettier: 'error'
  prettierRecommended,

  // Custom rules (mirrors .eslintrc.js rules block verbatim)
  {
    files: ['**/*.{js,cjs,mjs,ts}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      import: importPlugin
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts']
        }
      }
    },
    rules: {
      'spaced-comment': 'off',
      'no-console': 'warn',
      'consistent-return': 'off',
      'func-names': 'off',
      'object-shorthand': 'off',
      'no-process-exit': 'off',
      'no-param-reassign': 'off',
      'no-return-await': 'off',
      'no-underscore-dangle': 'off',
      'class-methods-use-this': 'off',
      'prefer-destructuring': ['warn', { object: true, array: false }],
      'no-unused-vars': ['warn', { argsIgnorePattern: 'req|res|next|val' }],
      '@typescript-eslint/no-unused-vars': 'warn',
      'valid-typeof': 'warn',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          ts: 'never'
        }
      ],
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Internal packages
            ['^@macolmenerori?\\w'],
            // External packages
            ['^@?\\w'],
            // Aliased commonly used directories
            [
              '^(api|assets|common|components|locales|mocks|pages|src|services|state|styles|types|utils)(/.*|$)'
            ],
            // Side effect imports
            ['^\\u0000'],
            // Parent imports. Put `..` last
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports. Put same-folder imports, `.` and style imports last
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$']
          ]
        }
      ],
      'no-useless-escape': 'warn'
    }
  }
];
