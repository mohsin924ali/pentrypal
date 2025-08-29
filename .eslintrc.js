module.exports = {
  root: true,
  extends: [
    '@react-native',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'plugin:jest/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'react-native',
    '@typescript-eslint',
    'jest',
    'detox',
    'prettier',
  ],
  env: {
    'react-native/react-native': true,
    es2021: true,
    node: true,
    jest: true,
    'detox/detox': true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-require-imports': 'warn',

    // React specific rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    'react/no-unused-prop-types': 'warn',
    'react/no-unused-state': 'warn',
    'react/prefer-stateless-function': 'warn',
    'react/no-unescaped-entities': 'warn',

    // React Native specific rules
    'react-native/no-unused-styles': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off',
    'react-native/sort-styles': 'warn',

    // General rules
    'prettier/prettier': 'warn',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    eqeqeq: ['error', 'always'],
    'no-duplicate-imports': 'warn',
    'sort-imports': ['warn', { ignoreDeclarationSort: true }],
    'no-useless-escape': 'warn',

    // Security rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-script-url': 'error',
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'react-native/no-inline-styles': 'off',
      },
    },
    {
      files: ['*.js', '.eslintrc.js', '*.config.js'],
      extends: ['eslint:recommended'],
      parserOptions: {
        project: null,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['App.*.tsx', 'App.test.tsx'],
      parserOptions: {
        project: null,
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'dist/',
    'build/',
    '.expo/',
    'web-build/',
    'android/',
    'ios/',
    '*.config.js',
    '.eslintrc.js',
    'index.js',
    'App.complex.tsx',
    'App.minimal.tsx',
    'App.original.tsx',
    'App.test.tsx',
  ],
};
