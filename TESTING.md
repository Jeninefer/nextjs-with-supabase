# Testing Documentation

## Overview

Comprehensive unit tests have been generated for all files modified in the current branch (compared to `main`). The testing infrastructure uses **Vitest** with **React Testing Library** for component and hook testing.

## Test Coverage Summary

### Files Tested

1. **`lib/utils.ts`** - Utility functions
   - `cn()` - Class name merging utility
   - `hasEnvVars` - Environment variable validation
   
2. **`lib/supabase/client.ts`** - Supabase browser client
   - Client creation and configuration
   - Environment variable handling

3. **`lib/supabase/server.ts`** - Supabase server client
   - Server-side client creation
   - Cookie adapter implementation
   - Error handling

4. **`app/dashboard/financial/hooks/useMCPIntegration.ts`** - MCP Integration hook
   - Server initialization
   - Financial data search
   - Market data fetching
   - Analysis storage and retrieval

5. **`middleware.ts`** - Next.js middleware
   - Authentication flow
   - Route protection
   - Cookie handling

## Statistics

- **Total Test Files**: 5
- **Total Test Cases**: 71
- **Total Lines of Test Code**: 1,365 lines

### Breakdown by File

| File | Test Cases | Lines | Description |
|------|-----------|-------|-------------|
| `lib/__tests__/utils.test.ts` | 17 | 135 | Tests for utility functions |
| `lib/supabase/__tests__/client.test.ts` | 6 | 106 | Browser client tests |
| `lib/supabase/__tests__/server.test.ts` | 10 | 210 | Server client tests |
| `app/dashboard/financial/hooks/__tests__/useMCPIntegration.test.ts` | 25 | 597 | Hook integration tests |
| `__tests__/middleware.test.ts` | 13 | 317 | Middleware tests |

## Testing Framework

### Vitest

- **Fast**: Blazing fast unit test framework
- **ESM First**: Native ES modules support
- **TypeScript**: Full TypeScript support out of the box
- **Compatible**: Jest-compatible API

### React Testing Library

- **User-centric**: Tests focus on how users interact with components
- **Best practices**: Encourages accessible and maintainable tests
- **React 19**: Compatible with the latest React version

## Installation

The test dependencies have been added to `package.json`. Install them with:

```bash
npm install
```

### Dependencies Added

```json
{
  "devDependencies": {
    "@testing-library/react": "^16.0.1",
    "@testing-library/react-hooks": "^8.0.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@vitejs/plugin-react": "^4.3.4",
    "@vitest/ui": "^2.1.8",
    "@vitest/coverage-v8": "^2.1.8",
    "jsdom": "^25.0.1",
    "vitest": "^2.1.8"
  }
}
```

## Running Tests

### Run All Tests (Watch Mode)

```bash
npm test
```

This runs Vitest in watch mode, automatically re-running tests when files change.

### Run Tests Once

```bash
npm run test:run
```

Runs all tests once and exits. Useful for CI/CD pipelines.

### Run Tests with UI

```bash
npm run test:ui
```

Opens an interactive UI to explore and run tests.

### Run Tests with Coverage

```bash
npm run test:coverage
```

Generates a coverage report showing which lines of code are tested.

## Test Structure

### 1. `lib/__tests__/utils.test.ts`

Tests the utility functions:

#### `cn()` Function Tests
- Basic class name merging
- Conditional classes
- Handling undefined/null values
- Array of classes
- Tailwind class merging
- Object notation
- Complex combinations
- Edge cases (empty, falsy values)

#### `hasEnvVars` Constant Tests
- Valid environment variables
- Missing variables
- Empty strings
- Whitespace-only values
- Partial validity
- Undefined values

**Key Test Patterns:**
```typescript
describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })
})
```

### 2. `lib/supabase/__tests__/client.test.ts`

Tests the Supabase browser client:

- Client creation with correct environment variables
- Environment variable usage (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Missing environment variables handling
- Multiple client instances
- Different URL formats

**Key Test Patterns:**
```typescript
it('should create browser client with correct environment variables', async () => {
  const mockClient = { auth: {}, from: vi.fn() }
  vi.mocked(createBrowserClient).mockReturnValue(mockClient)
  
  const client = createClient()
  
  expect(createBrowserClient).toHaveBeenCalledWith(
    'https://test.supabase.co',
    'test-anon-key'
  )
})
```

### 3. `lib/supabase/__tests__/server.test.ts`

Tests the Supabase server client:

- Server client creation with cookies adapter
- Cookie store getAll method
- Cookie store setAll method
- Array-like cookie objects
- Invalid cookie stores
- Error handling
- Promise-based cookie stores
- Environment variables

**Key Test Patterns:**
```typescript
it('should handle cookie store with getAll method', async () => {
  const mockCookieStore = {
    getAll: vi.fn().mockReturnValue(testCookies),
    set: vi.fn(),
  }
  
  const client = await createClient()
  // Test cookie adapter functionality
})
```

### 4. `app/dashboard/financial/hooks/__tests__/useMCPIntegration.test.ts`

Comprehensive tests for the MCP integration hook:

#### Initialization Tests
- Default state
- Automatic server initialization
- Cleanup on unmount
- Environment variable handling
- Error handling
- Success scenarios

#### Server Check Tests
- Error when server not initialized
- Allow operations when initialized

#### Financial Insights Tests
- Successful searches
- Empty queries
- Special characters
- Various query formats

#### Market Data Tests
- URL fetching
- Different URL formats
- Error handling

#### Storage Tests
- Store analysis results
- Handle undefined values
- Complex objects
- Logging behavior

#### Retrieval Tests
- Get stored analysis
- Non-existent data handling

#### Re-initialization Tests
- Manual re-initialization
- Error state reset
- Loading states

#### Error Handling Tests
- Uninitialized server errors
- State consistency

#### Environment Variable Tests
- Empty variables
- Whitespace-only variables
- Missing required variables

**Key Test Patterns:**
```typescript
it('should initialize with default state', () => {
  const { result } = renderHook(() => useMCPIntegration())
  
  expect(result.current.isInitialized).toBe(false)
  expect(result.current.isLoading).toBe(true)
  expect(result.current.error).toBe(null)
})
```

### 5. `__tests__/middleware.test.ts`

Tests Next.js middleware functionality:

- Supabase client creation
- Authenticated user access
- Unauthenticated user redirects
- Public route access (sign-in, sign-up, auth, root)
- Cookie handling (getAll, setAll)
- Cookie preservation
- Auth error handling
- Static asset exclusion
- Environment variable usage

**Key Test Patterns:**
```typescript
it('should redirect unauthenticated users to sign-in', async () => {
  vi.mocked(createServerClient).mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  })
  
  const response = await middleware(mockRequest)
  
  expect(response.status).toBe(307)
  expect(response.headers.get('location')).toContain('/sign-in')
})
```

## Configuration Files

### vitest.config.ts

Configures Vitest with:
- React plugin for JSX/TSX support
- jsdom environment for DOM simulation
- Global test APIs
- Coverage configuration
- Path aliases matching tsconfig.json

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

### vitest.setup.ts

Setup file that runs before each test:
- Cleanup after each test
- Clear all mocks
- Set default environment variables

```typescript
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
```

## Best Practices Implemented

### 1. **Comprehensive Coverage**
- Happy paths tested
- Edge cases covered
- Error conditions validated
- Boundary conditions checked

### 2. **Isolation**
- Each test is independent
- Mocks are cleared between tests
- No shared state

### 3. **Descriptive Naming**
- Test names clearly describe what they test
- Grouped by functionality using `describe` blocks

### 4. **Mocking Strategy**
- External dependencies mocked
- Mock implementations match real behavior
- Easy to update when dependencies change

### 5. **Async Handling**
- Proper use of `async/await`
- `waitFor` for asynchronous state changes
- `act` for React state updates

### 6. **Type Safety**
- Full TypeScript support
- Type-safe mocks
- No `any` types where possible

## Common Test Patterns

### Testing React Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react'

it('should handle state changes', async () => {
  const { result } = renderHook(() => useYourHook())
  
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })
  
  expect(result.current.data).toBeDefined()
})
```

### Testing with Mocks

```typescript
import { vi } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(),
}))

it('should use mocked dependency', () => {
  const mockFn = vi.fn().mockReturnValue('mocked value')
  expect(mockFn()).toBe('mocked value')
})
```

### Testing Environment Variables

```typescript
const originalEnv = process.env

beforeEach(() => {
  process.env = { ...originalEnv }
})

afterEach(() => {
  process.env = originalEnv
})

it('should handle env vars', () => {
  process.env.MY_VAR = 'test-value'
  // Test code
})
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

## Coverage Goals

Current coverage targets:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

View coverage report after running:
```bash
npm run test:coverage
```

The report will be generated in `coverage/` directory. Open `coverage/index.html` in a browser to see detailed coverage information.

## Troubleshooting

### Tests Failing After Dependency Update

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Update snapshots if needed:
   ```bash
   npm test -- -u
   ```

### Mock Not Working

Ensure mocks are defined before imports:
```typescript
vi.mock('module-name', () => ({
  exportedFunction: vi.fn(),
}))

// Import after mock definition
import { exportedFunction } from 'module-name'
```

### Async Test Timeout

Increase timeout for specific tests:
```typescript
it('long running test', async () => {
  // Test code
}, 10000) // 10 second timeout
```

## Future Enhancements

### Potential Additions

1. **Integration Tests**: Test multiple components together
2. **E2E Tests**: Full user flow testing with Playwright
3. **Visual Regression**: Screenshot comparison testing
4. **Performance Tests**: Measure component render times
5. **Accessibility Tests**: Automated a11y checks

### Coverage Expansion

Consider adding tests for:
- Additional edge cases discovered in production
- New features as they're added
- Bug fixes (add test that reproduces bug first)

## Contributing

When adding new code:

1. Write tests alongside the implementation
2. Ensure all existing tests pass
3. Aim for >80% coverage on new code
4. Follow existing test patterns
5. Update this documentation if needed

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Mocking with Vitest](https://vitest.dev/guide/mocking.html)

## Support

For questions or issues with tests:
1. Check existing test patterns in this repo
2. Review Vitest documentation
3. Check React Testing Library docs
4. Review error messages carefully - they often contain helpful hints

---

**Last Updated**: October 27, 2025
**Test Framework**: Vitest 2.1.8
**Testing Library**: @testing-library/react 16.0.1