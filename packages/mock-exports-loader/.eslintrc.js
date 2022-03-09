module.exports = {
    extends: [
        '@g4iz/eslint-rules',
    ],
    parserOptions: {
        tsconfigRootDir: __dirname,
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        },
    },
  };
  