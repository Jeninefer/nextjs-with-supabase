import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const loginFormSource = readFileSync(
  resolve(__dirname, '..', '..', 'components/login-form.tsx'),
  'utf8',
);

test('login form source defines heading and description copy', () => {
  assert.ok(
    loginFormSource.includes('CardTitle className="text-2xl">Login'),
    'expected Login heading',
  );
  assert.ok(
    loginFormSource.includes('Enter your email below to login to your account'),
    'expected descriptive helper text',
  );
});

test('login form source wires email and password inputs', () => {
  assert.ok(
    loginFormSource.includes('<Label htmlFor="email">Email</Label>'),
    'expected explicit email label',
  );
  assert.ok(
    loginFormSource.includes('id="email"'),
    'expected email input id',
  );
  assert.ok(
    loginFormSource.includes('<Label htmlFor="password">Password</Label>'),
    'expected password label',
  );
  assert.ok(
    loginFormSource.includes('type="password"'),
    'expected password input type',
  );
});

test('login form source links to password reset and sign-up routes', () => {
  assert.ok(
    loginFormSource.includes('href="/auth/forgot-password"'),
    'expected forgot password link',
  );
  assert.ok(
    loginFormSource.includes('href="/auth/sign-up"'),
    'expected sign-up link',
  );
});

test('login form source includes loading copy for the submit button', () => {
  assert.ok(
    loginFormSource.includes('disabled={isLoading}'),
    'submit button should respect loading flag',
  );
  assert.ok(
    loginFormSource.includes('isLoading ? "Logging in..." : "Login"'),
    'loading copy should be present in button JSX',
  );
});
