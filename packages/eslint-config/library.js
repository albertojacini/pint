module.exports = {
  extends: ['./index.js'],
  env: {
    node: true,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
    },
  ],
}
