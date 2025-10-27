# Test Suite

This directory contains comprehensive unit tests for the Next.js with Supabase project.

## Overview

The test suite covers:

- **Utility functions** (`lib/utils.ts` and `lib/risk-indicators.ts`)
- **Supabase client configurations** (both browser and server clients)
- **React components** (including form components and authentication)

## Test Structure

```
__tests__/
├── lib/
│   ├── utils.test.ts              # Tests for className utility function
│   ├── risk-indicators.test.ts    # Tests for risk assessment functions
│   └── supabase/
│       ├── client.test.ts         # Tests for browser Supabase client
│       └── server.test.ts         # Tests for server Supabase client
├── components/
│   ├── auth-button.test.tsx       # Tests for authentication button
│   └── login-form.test.tsx        # Tests for login form component
├── setup.test.ts                  # Basic environment setup tests
└── README.md                      # This file
```

## Test Coverage

### Utility Functions

- **`cn` function**: Tests class name merging, conditional classes, Tailwind CSS conflicts
- **Risk indicators**: Tests risk level calculations, edge cases, and emoji indicators

### Supabase Integration

- **Browser client**: Tests client creation, environment variables, auth methods
- **Server client**: Tests cookie handling, server-side authentication, error handling

### React Components

- **AuthButton**: Tests authenticated/unauthenticated states, user display, navigation links
- **LoginForm**: Tests form submission, validation, error handling, loading states

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage Report

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- utils.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="risk indicator"
```

## Test Framework

- **Jest**: Test runner and assertion library
- **React Testing Library**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: User interaction simulation

## Key Testing Patterns

### Component Testing

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('component renders correctly', () => {
  render(<MyComponent />)
  expect(screen.getByText('Expected Text')).toBeInTheDocument()
})

test('user can interact with component', async () => {
  const user = userEvent.setup()
  render(<MyComponent />)
  
  await user.click(screen.getByRole('button'))
  expect(mockFunction).toHaveBeenCalled()
})
```

### Async Testing

```typescript
test('async operation completes', async () => {
  mockAsyncFunction.mockResolvedValue('success')
  
  render(<MyComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('success')).toBeInTheDocument()
  })
})
```

### Mock Testing

```typescript
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signIn: jest.fn()
    }
  })
}))
```

## Configuration Files

- **`jest.config.js`**: Main Jest configuration
- **`jest.setup.js`**: Test environment setup
- **`tsconfig.test.json`**: TypeScript configuration for tests

## Environment Variables

Tests use mock environment variables defined in `jest.setup.js`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

## Mocking Strategy

### Next.js Modules

- `next/navigation`: Router and navigation hooks
- `next/headers`: Server-side cookie handling
- `next/link`: Link component

### Supabase

- Client creation and authentication methods
- Database operations and error handling

### UI Components

- Simplified implementations for testing purposes
- Preserve essential props and behaviors

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what users experience
2. **Use Descriptive Test Names**: Clearly state what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
4. **Mock External Dependencies**: Isolate units under test
5. **Test Edge Cases**: Include boundary conditions and error scenarios
6. **Async Testing**: Properly handle asynchronous operations with `waitFor`

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test -- --coverage --watchAll=false
```

## Contributing

When adding new components or utilities:

1. Create corresponding test files
2. Follow existing naming conventions
3. Include tests for happy path, edge cases, and error scenarios
4. Update this README if adding new test categories
5. Ensure tests pass before submitting PRs

## Troubleshooting

### Common Issues

**Module not found errors**: Check path mappings in `jest.config.js`
**TypeScript errors**: Verify `tsconfig.test.json` includes test files
**Mock issues**: Ensure mocks are properly configured in `jest.setup.js`

### Debugging Tests

```bash
# Run tests with verbose output
npm test -- --verbose

# Debug specific test
npm test -- --testNamePattern="specific test" --verbose
```
