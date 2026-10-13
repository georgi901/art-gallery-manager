const eslint = require('@eslint/js');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'public/**',
      'coverage/**',
      'uploads/**',
      'docs/**',
      'package-lock.json'
    ]
  },
  eslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly'
      }
    },
    rules: {
      'no-console': ['error', { allow: ['error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['server.js', 'scripts/**/*.js', 'tests/**/*.js'],
    rules: {
      'no-console': 'off'
    }
  }
];
