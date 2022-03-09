// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
    extends: [
        require.resolve('@g4iz/eslint-rules'),
    ],
    ignorePatterns: ['.eslintrc.js', 'dist', 'jest.config.js'],
};
