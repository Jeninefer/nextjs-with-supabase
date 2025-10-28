import test from 'node:test';
import assert from 'node:assert/strict';

import { cn } from '../lib/utils';

test('cn merges tailwind class names without duplicates', () => {
  const merged = cn('px-4', 'py-2', 'px-4', { 'text-sm': true, hidden: false });
  assert.equal(merged, 'px-4 py-2 text-sm');
});

test('cn gracefully handles falsy values', () => {
  const merged = cn(undefined, null, false, 'block');
  assert.equal(merged, 'block');
});
