import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  {
    ignores: [
      'supabase/functions/**/*',
      'users/**/*',
      'models/**/*',
      'apiClient.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
];

export default config;
